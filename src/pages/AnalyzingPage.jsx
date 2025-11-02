import React, { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import { useLocation, useNavigate } from "react-router-dom";
import { useModel } from "../context/ModelContext";
import DotLoading from "../components/DotLoading";
import labels from "../utils/labels.json";
import { Colors } from "../utils/renderBox";
import { renderBoxes } from "../utils/renderBox";
import { UndoIcon } from "lucide-react";

const AnalyzingPage = () => {

    // 백엔드 URL
    // 모바일 테스트의 경우, 자신의 PC IP 삽입(모바일과 같은 네트워크)
    // PC의 백엔드 URL 경우, localhost로 변경
    const API_URL = process.env.REACT_APP_API_BASE_URL;

    const { model } = useModel();
    const { state } = useLocation();
    const navigate = useNavigate();

    //전달받은 변수들
    const mealImage = state?.mealImage;
    const mealTime = state?.mealTime;
    const selectedDate = state?.selectedDate;

    //변수 정의
    const [foodList, setFoodList] = useState([]); //감지된 음식 리스트
    const [userMeal, setUserMeal] = useState([]); //사용자 식사 배열 (백엔드 전송용)
    const [resultBoxes, setResultBoxes] = useState([]);

    const imageRef = useRef(null);
    const canvasRef = useRef(null);

    //전달 받은 변수: 디버그 코드
    console.log("AnalyzingPage >> mealImage 길이:", mealImage?.length, "selectedDate:", selectedDate, "mealTime:", mealTime);

    //이미지 로딩 후 추론
    useEffect(() => {
        if (!model || !mealImage) return;

        const img = new Image();
        img.onload = () => {
            detectFrame(img, model);
        };
        img.crossOrigin = "anonymous";
        img.src = mealImage;
    }, [mealImage]);

    // foodList → userMeal 업데이트 (배열 그대로 복사)
    useEffect(() => {
        if (foodList.length > 0) setUserMeal([...foodList]);
    }, [foodList]);

    // 백엔드 연동: 서버에 userMeal 전송
    useEffect(() => {
        if (userMeal.length > 0) sendDataToServer();
    }, [userMeal]);


    // 이미지 전처리 함수
    const preprocess = (source, modelWidth, modelHeight) => {
        return tf.tidy(() => {
            const img = tf.browser.fromPixels(source);
            const [h, w] = img.shape.slice(0, 2);

            // 긴 변을 기준으로, 이미지를 정사각형으로 패딩
            const maxSize = Math.max(w, h);
            const imgPadded = img.pad([
                [0, maxSize - h], // padding y
                [0, maxSize - w], // padding x
                [0, 0],
            ]);

            // 최종 입력 텐서 생성
            const processedInput = tf.image.resizeBilinear(imgPadded, [modelWidth, modelHeight])
                .div(255.0)
                .expandDims(0);

            // 바운딩 박스 변환에 필요한 비율 계산
            const xRatio = maxSize / modelWidth;
            const yRatio = maxSize / modelHeight;

            // 텐서와 함께 비율 정보도 반환
            return { input: processedInput, xRatio, yRatio};
        });
    };


    const detectFrame = async (source, model) => {
        tf.engine().startScope();
        try {
            const [modelHeight, modelWidth] = model.inputShape.slice(1, 3);

            // 💡 preprocess에서 반환한 비율을 사용
            const { input, xRatio, yRatio} = preprocess(source, modelWidth, modelHeight);

            const res = model.net.execute(input);
            const transRes = tf.tidy(() => res.transpose([0, 2, 1]).squeeze());

            //객체 박스 추출
            const boxes = tf.tidy(() => {
                const w = transRes.slice([0, 2], [-1, 1]);
                const h = transRes.slice([0, 3], [-1, 1]);
                const x1 = tf.sub(transRes.slice([0, 0], [-1, 1]), tf.div(w, 2));
                const y1 = tf.sub(transRes.slice([0, 1], [-1, 1]), tf.div(h, 2));
                return tf.concat([y1, x1, tf.add(y1, h), tf.add(x1, w)], 1).squeeze();
            });

            const [scores, classes] = tf.tidy(() => {
                const numClasses = transRes.shape[1] - 5;
                const rawScores = transRes.slice([0, 5], [-1, numClasses]).squeeze();
                return [rawScores.max(1), rawScores.argMax(1)];
            });

            const nms = await tf.image.nonMaxSuppressionAsync(boxes, scores, 50, 0.4, 0.7);
            const nmsArray = await nms.array();

            const detectionTensor = tf.tidy(() => {
                if (nms.size === 0) return tf.tensor([]);
                const selectedBoxes = tf.gather(boxes, nmsArray);
                const selectedScores = tf.gather(scores, nmsArray).expandDims(1);
                const selectedClasses = tf.gather(classes, nmsArray).expandDims(1);
                return tf.concat([selectedBoxes, selectedScores, selectedClasses], 1);
            });

            const data = await detectionTensor.array();
            const result = [];
            const canvas = canvasRef.current;
            const img = imageRef.current;
            //const ctx = canvas.getContext("2d");

            // 캔버스 크기를 원본 이미지 크기와 똑같이 맞춰주기
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            const boxesToDraw = data.map(([y1, x1, y2, x2, score, classId]) => {
                const label = labels[classId];
                if (!result.includes(label)) result.push(label);

                // 좌표변환1. 모델이 반환한 좌표를 패딩된 이미지 크기로 변환
                let finalX1 = x1 * xRatio;
                let finalY1 = y1 * yRatio;
                let finalX2 = x2 * xRatio;
                let finalY2 = y2 * yRatio;

                // 좌표변환2. (y1, x1, y2, x2)를 (x, y, width, height) 형식으로 변환
                const x = finalX1;
                const y = finalY1;
                const width = finalX2 - finalX1;
                const height = finalY2 - finalY1;

                // 좌표변환3. 음수 좌표와 너무 작은 박스 제거
                if (x < 0 || y < 0 || width <= 1 || height <= 1) {
                    return null;
                }

                return {
                    box: [y, x, height, width], // y,x,h,w 형식으로 전달
                    score,
                    label,
                    color: new Colors().get(classId),
                };
            }); // 유효하지 않은 박스 제거

            setFoodList(result);
            setResultBoxes(boxesToDraw);

            // 바운딩 박스 그리기 함수 호출
            // renderBoxes(ctx, boxesToDraw);

        } catch (err) {
            console.error("에러 발생:", err);
        } finally {
            tf.engine().endScope();
        }
    };

    // 백엔드 연결
    const sendDataToServer = async () => {
        try {
            await testGetNutritionByFoodName();
            const mealInfo = await testEachNutrition();
            navigate("/result", {
                state: {
                    mealInfo,
                    userMeal,
                    mealImage,
                    mealTime,
                    selectedDate,
                    resultBoxes,
                },
            });
            console.log("reuslt 페이지 userMeal 확인: " + userMeal)
        } catch (err) {
            console.error("🚨 API 호출 실패:", err);
        }
    };

    // 백엔드 : 영양성분 API 호출 + Nutrition DB 저장
    // 파라미터: 배열
    const testGetNutritionByFoodName = async () => {
        for (const foodName of userMeal) {
            try {
                const res = await fetch(`${API_URL}/nutrition?foodName=${encodeURIComponent(foodName)}`);
                if (!res.ok) throw new Error(`❌ ${foodName} 실패`);
                const data = await res.json();
                console.log(`${foodName} 영양정보 저장 결과:`, data);
            } catch (err) {
                console.error("영양 성분 API 호출 에러:", err);
            }
        }
    };

    // 백엔드: 음식별 영양성분 + 총 kcal 반환
    const testEachNutrition = async () => {
        try {
            const res = await fetch(`${API_URL}/nutrition/each`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ foodNames: foodList })
            });
            const data = await res.json();
            console.log(`${foodList} 영양성분:`, data.items);
            console.log(`${foodList} 총 kcal:`, data.totalKcal);
            return data;
        } catch (err) {
            console.error("영양성분 가져오기 호출 실패:", err);
        }
    };


    return (
        <div className="min-h-screen bg-white">

            <div className="max-w-xl mx-auto px-4">
                {/* 나가기 버튼 */}
                <div className="text-right">
                    <button
                        onClick={() => navigate("/main")}
                        className="mt-4 text-gray-500 hover:text-red-600 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                <h1 className="text-lg font-semibold mb-5">식사 분석</h1>

                {/* 이미지 + 캔버스 (박스 포함) */}
                <div className="relative w-full max-w-md mx-auto">
                    <img
                        ref={imageRef}
                        src={mealImage}
                        className="w-full rounded-md"
                        crossOrigin="anonymous"
                        alt="식사 이미지"
                    />
                    <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    />
                </div>
                <div className="mt-4 text-m text-center">
                    <DotLoading text="사진 분석 중입니다" />
                    <p className="text-sm text-gray-500 mt-2 mb-2"> 날짜: {selectedDate} / 시간: {mealTime} </p>

                    
                    {userMeal.length === 0 ? (
                        <p className="text-sm">분석 결과가 없습니다.</p>
                    ) : (
                        <p className="text-sm"> 분석 결과: {userMeal.join(", ")}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyzingPage;