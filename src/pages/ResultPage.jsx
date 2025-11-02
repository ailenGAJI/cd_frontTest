import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { renderBoxes } from "../utils/renderBox";
import AlertModal from "../components/modal/AlertModal";

const ResultPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [showAlertModal, setShowAlertModal] = useState(false);


  // AnalyzingPage로부터 전달받은 원본 데이터
  const { mealImage, mealTime, selectedDate, mealInfo, resultBoxes } = state;
  const getOptions = () => [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

  // 수량에 따라 실시간으로 변하는 식사 정보와 총 영양성분 상태
  const [adjustedMealInfo, setAdjustedMealInfo] = useState([]);
  const [totalNutrients, setTotalNutrients] = useState({
    kcal: 0,
    carbohydrate: 0,
    protein: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  });

  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // AdjustedMealInfo 초기 데이터 로딩 및 상태 초기화
  useEffect(() => {
    if (mealInfo?.items) {
      // 원본 mealInfo를 기반으로 새로운 상태 배열 생성
      const initialAdjustedMealInfo = mealInfo.items.map((item) => ({
        ...item,
        quantity: 1, // 초기 수량은 1인분
      }));
      setAdjustedMealInfo(initialAdjustedMealInfo);
    }
  }, [mealInfo]);

  // adjustedMealInfo가 변경될 때마다 총 영양성분 재계산
  useEffect(() => {
    if (adjustedMealInfo.length > 0) {
      const newTotal = adjustedMealInfo.reduce(
        (acc, item) => {
          // 각 영양성분별로 수량에 맞게 재계산하여 더함
          const quantity = item.quantity;
          return {
            kcal: acc.kcal + (item.nutrition.kcal * quantity),
            carbohydrate: acc.carbohydrate + (item.nutrition.carbohydrate * quantity),
            protein: acc.protein + (item.nutrition.protein * quantity),
            fat: acc.fat + (item.nutrition.fat * quantity),
            fiber: acc.fiber + (item.nutrition.fiber * quantity),
            sugar: acc.sugar + (item.nutrition.sugar * quantity),
            sodium: acc.sodium + (item.nutrition.sodium * quantity),
          };
        },
        { kcal: 0, carbohydrate: 0, protein: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
      );
      // 소수점 둘째 자리까지 반올림
      setTotalNutrients({
        kcal: newTotal.kcal.toFixed(1),
        carbohydrate: newTotal.carbohydrate.toFixed(1),
        protein: newTotal.protein.toFixed(1),
        fat: newTotal.fat.toFixed(1),
        fiber: newTotal.fiber.toFixed(1),
        sugar: newTotal.sugar.toFixed(1),
        sodium: newTotal.sodium.toFixed(1),
      });
    } else {
      // 음식 전부 삭제됐을 때
      setTotalNutrients({
        kcal: "0.0",
        carbohydrate: "0.0",
        protein: "0.0",
        fat: "0.0",
        fiber: "0.0",
        sugar: "0.0",
        sodium: "0.0",
      });
    }
  }, [adjustedMealInfo]);

  // 수량 변경 핸들러
  const handleQuantityChange = (index, newQuantity) => {
    const updatedMealInfo = [...adjustedMealInfo];
    if (updatedMealInfo[index]) {
      updatedMealInfo[index].quantity = parseFloat(newQuantity);
      setAdjustedMealInfo(updatedMealInfo);
    }
  };

  // 삭제 버튼 핸들러
  const handleDelete = (targetItem) => {
    // 해당 음식 삭제
    const updated = adjustedMealInfo.filter(item => item !== targetItem);
    setAdjustedMealInfo(updated);
  };


  // 이미지 위 박스 렌더링
  useEffect(() => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !img || !resultBoxes || resultBoxes.length === 0) return;
    

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderBoxes(ctx, resultBoxes);
  }, [resultBoxes, imageRef.current]);


  // "확인" 버튼 클릭 시 FeedbackPage로 이동하며 최종 데이터 전달
  const handleConfirm = () => {

    console.log(
      "ResultPage 디버깅, 현재 식사 이름 목록: ",
      adjustedMealInfo.map(item => item.name)
    );

    // 식사 객체가 없을 경우
    if (adjustedMealInfo.length === 0) {
      setShowAlertModal(true);
      return;
    }

    const finalMealInfo = {
      items: adjustedMealInfo,
      total: totalNutrients,
    };
    navigate("/Feedback", {
      state: {
        finalMealInfo,
        mealImage,
        mealTime,
        selectedDate,
      },
    });
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

        <p className="text-sm text-gray-500 mt-3 text-center">
          날짜: {selectedDate} / 시간: {mealTime}
        </p>

        {/* 총 칼로리 정보 */}
        <div className="mb-3 mt-4 p-3 border border-[#587650] rounded">
          <h2 className="text-lg font-bold mb-2">총 {totalNutrients.kcal} kcal</h2>
          <p className="text-sm">
            칼로리는 <span className="font-bold">1인분</span> 기준으로 제공됩니다.
          </p>
        </div>

        {/* 식사 구성 목록 */}
        {adjustedMealInfo.map((item, index) => (
          <div key={index} className="mb-2 p-3 border border-[#587650] rounded">
            <div className="flex justify-between items-center mb-1">
              <span className="text-base">
                <span className="font-semibold">{item.name}</span>
                <span className="text-xs text-gray-500 ml-1">
                  1회 제공량 {item.nutrition.servingSize}g
                </span>
              </span>

              {/* 음식 제거 버튼 */}
              <button onClick={() => handleDelete(item)}>
                <Trash2 className="w-5 h-5 text-red-700 hover:text-red-900" />
              </button>
            </div>

            <div className="flex justify-between text-sm">
              <div>
                {/* 수량에 따라 실시간으로 변경되는 칼로리 표시 */}
                <p>{(item.nutrition.kcal * item.quantity).toFixed(1)} kcal</p>
                <p>
                  탄수화물: {(item.nutrition.carbohydrate * item.quantity).toFixed(1) ?? "정보 없음"}g,
                  단백질: {(item.nutrition.protein * item.quantity).toFixed(1) ?? "정보 없음"}g,
                  지방: {(item.nutrition.fat * item.quantity).toFixed(1) ?? "정보 없음"}g
                </p>
              </div>

              <div className="flex items-center ml-2">
                <select
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(index, e.target.value)}
                  className="text-sm border border-[#8A9352] px-2 py-1 rounded"
                >
                  {getOptions().map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <span className="text-sm ml-1">인분</span>
              </div>
            </div>
          </div>
        ))}


        {/* 확인 버튼 */}
        <button
          onClick={handleConfirm} // 핸들러 함수 호출
          className="block px-4 py-2 border border-[#8A9352] bg-[#8A9352] hover:bg-[#6B8E23] text-white font-semibold rounded w-fit mx-auto mt-4 mb-4"
        >
          확인
        </button>


        {showAlertModal && (<AlertModal alert={"분석할 식사가 없습니다."} checkHandle={() => { setShowAlertModal(false); navigate('/main'); }} />)}
      </div>
    </div>
  );
};

export default ResultPage;