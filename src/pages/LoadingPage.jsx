import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useModel } from "../context/ModelContext"; //모델 전역 사용 context API
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import CircularLoading from "../components/CircularLoading";

const LoadingPage = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState({ loading: true, progress: 0 });
  //전역 context에 model 저장
  const { setModel } = useModel();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. (구글/카카오 로그인)토큰처리 : 확인 + 저장 + url 정리
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        // 디버깅
        if (token) {
          console.log("✅ 토큰 저장 직전:", token);
          localStorage.setItem("accessToken", token);
          console.log("✅ 저장 직후:", localStorage.getItem("accessToken"));

          // URL에서 토큰 제거 (보안 및 깔끔함)
          window.history.replaceState({}, document.title, "/loading");
        }

        // 3. 모델 로딩 준비
        await tf.ready(); // 백엔드 준비
        const modelBaseURL = window.location.origin;
        const modelName = "yolo_model";

        // 4. 모델 로드 시작
        const yolov8 = await tf.loadGraphModel(`${modelBaseURL}/${modelName}/model.json`, {
          onProgress: (fractions) => {
            setLoading({ loading: true, progress: fractions });
          },
        });

        // 5. 워밍업: 더 빠른 추론을 위해 더미 입력 실행
        const dummyInput = tf.randomUniform(yolov8.inputs[0].shape, 0, 1, "float32");
        const warmupResults = yolov8.execute(dummyInput);
        tf.dispose([dummyInput, warmupResults]);
        setLoading({ loading: false, progress: 1 });

        // 6. 모델 저장
        setModel({
          net: yolov8,
          inputShape: yolov8.inputs[0].shape,
          outputShape: warmupResults.shape,
        }); // Context에 저장

        // 디버그용
        console.log("모델 로딩 완료:", yolov8);
        console.log("모델 입력 형상:", yolov8.inputs[0].shape);

        // 7. main으로 이동
        navigate("/main")
      } catch (error) {
        console.error("초기화 중 오류:", error);
        setLoading({ loading: false, progress: 0 });
      }
    };

    initializeApp();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      {/* 로딩 퍼센트 표시 */}
      <CircularLoading value={parseFloat((loading.progress * 100).toFixed(2))} />
    </div>
  );
};

export default LoadingPage;
