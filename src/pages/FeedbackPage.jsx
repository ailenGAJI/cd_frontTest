import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TriangleAlert } from 'lucide-react';
import DotLoading from "../components/DotLoading";
import AlertModal from "../components/modal/AlertModal.jsx";

const FeedbackPage = () => {

  const API_URL = process.env.REACT_APP_API_BASE_URL;

  const { state } = useLocation();
  const navigate = useNavigate();

  const finalMealInfo = state?.finalMealInfo;
  const mealImage = state?.mealImage;
  const mealTime = state?.mealTime;
  const selectedDate = state?.selectedDate;

  const [cumulative, setCumulative] = useState([]);
  const [nutrients, setNutrients] = useState({});
  const [nutrientRatio, setNutrientRatio] = useState({ carb: 0, protein: 0, fat: 0 });
  const [notPointnutrientRatio, seNotPointNutrientRatio] = useState({ carb: 0, protein: 0, fat: 0 });
  const [feedbackText, setFeedbackText] = useState(null);
  const [dailyFeedbackText, setDailyFeedbackText] = useState(null);
  const [feedbackColor, setFeedbackColor] = useState(null); // 피드백 색상 컬러
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  const [isUserInfoLoading, setIsUserInfoLoading] = useState(true);

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertSentence, setAlertSentence] = useState("");


  const displayLabels = [
    { key: "carbohydrate", label: "탄수화물", unit: "g" },
    { key: "protein", label: "단백질", unit: "g" },
    { key: "fat", label: "지방", unit: "g" },
    { key: "fiber", label: "식이섬유", unit: "g" },
    { key: "sugar", label: "당류", unit: "g" },
    { key: "sodium", label: "나트륨", unit: "mg" }
  ];

  const pcIP = "localhost"; // 백엔드 IP

  // 컴포넌트 마운트 시 사용자 정보 가져오기
  useEffect(() => {
    fetchUserInfo();
    getDailyNutritionFetch();
  }, []);


  // finalMealInfo와 userInfo가 모두 있을 때만 피드백 API 호출
  useEffect(() => {
    if (finalMealInfo && !isUserInfoLoading && !feedbackText) {
      setNutrients(finalMealInfo);
      fetchDailyFeedbackFromDeepSeek(finalMealInfo, userInfo);
      fetchFeedbackFromDeepSeek(finalMealInfo, userInfo);
    }
  }, [finalMealInfo, userInfo, isUserInfoLoading]);

  useEffect(() => {
    if (dailyFeedbackText) {
      console.log("FeedbackPage >> 한줄 피드백 확인:", dailyFeedbackText);
    }
  }, [dailyFeedbackText]);

  // 탄단지 비율 계산
  useEffect(() => {
    if (nutrients.total) {
      const { carbohydrate, protein, fat } = nutrients.total;
      const total = parseFloat(carbohydrate) + parseFloat(protein) + parseFloat(fat);

      setNutrientRatio({
        carb: (carbohydrate / total) * 100,
        protein: (protein / total) * 100,
        fat: (fat / total) * 100,
      });

      // 비율 표시를 위한 소수점 없는 영양비율
      const notPointCarb = Math.floor((carbohydrate / total) * 100);
      const notPointProtein = Math.floor((protein / total) * 100);
      const notPointFat = Math.floor((fat / total) * 100);


      const hundredCheck = 100 - (notPointCarb + notPointProtein + notPointFat);

      const finalRatios = {
        carb: notPointCarb,
        protein: notPointProtein,
        fat: notPointFat,
      };

      // 퍼센트 100을 위한 보정: 차이(difference)만큼 가장 큰 값에 1씩 더해주기
      // 예를 들어, 차이가 2면, 가장 큰 값 두 개에 1씩 더해줌
      for (let i = 0; i < hundredCheck; i++) {
        let maxRatio = -1;
        let maxKey = '';

        // 가장 큰 값을 찾기
        for (const key in finalRatios) {
          if (finalRatios[key] > maxRatio) {
            maxRatio = finalRatios[key];
            maxKey = key;
          }
        }
        // 가장 큰 값에 1을 더하기
        finalRatios[maxKey] += 1;
      }

      seNotPointNutrientRatio(finalRatios);
    }
  }, [nutrients]);

  // base64 → Blob 변환 함수
  const dataURLtoBlob = (dataUrl) => {
    const arr = dataUrl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // 백엔드: 저장 요청
  const saveMeal = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();

      const blob = dataURLtoBlob(mealImage);
      const file = new File([blob], "meal.jpg", { type: blob.type });

      formData.append("image", file);

      const foodItems = finalMealInfo.items.map(item => ({
        name: item.name,
        quantity: item.quantity ?? 1 // 수량 없으면 1로 기본값
      }));
      formData.append("foodItems", JSON.stringify(foodItems));


      formData.append("date", selectedDate);
      formData.append("time", mealTime);
      formData.append("feedback", feedbackText);

      // 실제 계산된 값
      const mealNutrition = {
        kcal: finalMealInfo.total.kcal,
        carbohydrate: finalMealInfo.total.carbohydrate,
        protein: finalMealInfo.total.protein,
        fat: finalMealInfo.total.fat,
        sugar: finalMealInfo.total.sugar,
        fiber: finalMealInfo.total.fiber,
        sodium: finalMealInfo.total.sodium,
      };
      formData.append("mealNutrition", JSON.stringify(mealNutrition));
      formData.append("dailyFeedback", dailyFeedbackText);


      const res = await fetch(`${API_URL}/daily-nutrition/save-meal-with-daily`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });

      // 🚨 응답을 텍스트로 먼저 받아서 출력해보기
      if (!res.ok) {
        const errorText = await res.text();
        console.error("🚨 서버 응답 에러 (텍스트):", errorText); // ⬅️ 여기에 HTML 내용이 찍힐 거예요!
        throw new Error("서버 에러 발생");
      }

    const result = await res.json();
    console.log("✅ 저장 완료:", result);
    navigate("/main", { state: { selectedDate: selectedDate } }); // 저장 완료 후 메인으로 이동
  } catch (err) {
    console.error("🚨 저장 실패:", err);
    setShowAlertModal(true);
    setAlertSentence("저장 실패");
  }
};

// 사용자 정보를 백엔드에서 가져오는 함수
const fetchUserInfo = async () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("사용자 토큰이 없습니다.");

    const res = await fetch(`${API_URL}/user/body`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("FeedbackPage >> 사용자 정보를 가져오는 데 실패했습니다.");

    const data = await res.json();
    setUserInfo(data);
    console.log("FeedbackPage >> 사용자 정보 가져오기 성공:", data);
  } catch (err) {
    console.error("FeedbackPage >> 사용자 정보 요청 실패:", err);
    setUserInfo(null);
  } finally {
    setIsUserInfoLoading(false);
  }
};

// 하루 누적 총합 영양성분 조회
const getDailyNutritionFetch = async () => {
  const token = localStorage.getItem("accessToken");
  const date = selectedDate;
  console.log("FeedbackPage >> 하루 총합 조회 날짜 확인:", date, selectedDate)

  try {
    const res = await fetch(`${API_URL}/daily-nutrition/${date}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("하루 총합 조회 실패");

    const data = await res.json();
    setCumulative(data);
    console.log("✅ 하루 총합 조회 성공:", cumulative);
    console.log("✅ 하루 총합 조회 성공(data):", data);
    return data;
  } catch (err) {
    console.error("❌ 하루 총합 조회 실패:", err.message);
    return null;
  }
};


// DeepSeek API 호출 함수 (사용자 정보 포함)
const fetchFeedbackFromDeepSeek = async (mealData, userData) => {
  setIsLoading(true);
  console.log("FeedbackPage >> isLoading:", isLoading);

  // 식사에 대한 FeedBack
  try {
    if (!userData) {
      setFeedbackText("사용자 정보가 없어 일반 피드백을 생성합니다.");
    }

    // 현재 연도로 나이 계산
    const currentYear = new Date().getFullYear();
    const age = userData?.birthYear ? currentYear - userData.birthYear + 1 : "정보 없음";

    // 전달받은 데이터를 기반으로 프롬프트 생성
    const foodList = mealData.items.map(item => `${item.name} (${item.quantity}인분)`).join(', ');
    const prompt = `
      다음은 사용자의 식단 정보와 신체 정보입니다. 이 정보를 바탕으로 식사에 관한 구체적인 피드백과 
      저속노화를 위한 개선사항이 있다면 개선사항을 200자 이내로 작성하세요.
      
      ${userData ?
        `신체 정보: 나이 ${age}세, 키 ${userData.height}cm, 몸무게 ${userData.weight}kg` :
        `사용자 신체 정보: 정보 없음`
      }
        
        식단 정보: ${foodList}
        총 칼로리: ${mealData.total.kcal} kcal
        총 영양성분: 탄수화물 ${mealData.total.carbohydrate}g, 단백질 ${mealData.total.protein}g, 지방 ${mealData.total.fat}g,
        식이섬유 ${mealData.total.fiber}g, 당류 ${mealData.total.sugar}g, 나트륨 ${mealData.total.sodium}mg

        다음 지시사항을 반드시 지켜주세요.:
        1. 첫 번째 문단은 반드시 사용자의 식단 평가를 '이번 식사는 [나쁨/좋음/보통].' 형식으로 출력하고, 이 뒤에 줄 바꿈(개행)을 한 번 사용합니다.
        2. 답변을 '현재 식단의 피드백'과 '개선사항'으로 나누세요.
        3. 개선사항의 경우, 저속노화를 위해 현재 어떤 영양분이 부족하고 필요한지, 앞으로 어떤 영양분을 줄여야하는지 1~2문장으로 명시해주세요.
        4. 두 항목 사이를 반드시 두 번의 줄바꿈 문자(\n\n)로 구분하세요.
        1. 답변에 '**'와 같은 굵은 글씨 표시는 사용하지 마세요.
        `;

    // DeepSeek API 호출
    const res = await fetch(`https://api.deepseek.com/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.REACT_APP_DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        stream: false,
      }),
    });

    if (!res.ok) {
      console.error("DeepSeek API 오류:", res.status, await res.text());
      throw new Error("DeepSeek 피드백 생성 실패");
    }

    const data = await res.json();
    setFeedbackText(data.choices[0].message.content);
  } catch (err) {
    console.error("FeedbackPage >> DeepSeek 피드백 요청 실패:", err);
    setFeedbackText("피드백을 생성하는 데 실패했습니다.");
  } finally {
    setIsLoading(false);
  }
};

// DeepSeek API 호출: DailyFeedback
const fetchDailyFeedbackFromDeepSeek = async (mealData, userData) => {
  console.log("FeedbackPage >> isLoading:", isLoading);
  try {
    if (!userData) {
      setFeedbackText("사용자 정보가 없어 일반 피드백을 생성합니다.");
    }

    // 현재 연도로 나이 계산
    const currentYear = new Date().getFullYear();
    const age = userData?.birthYear ? currentYear - userData.birthYear + 1 : "정보 없음";

    // 전달받은 데이터를 기반으로 프롬프트 생성
    const foodList = mealData.items.map(item => `${item.name} (${item.quantity}인분)`).join(', ');
    const prompt = `
      다음은 사용자의 신체정보와 오늘 먹은 식사의 정보입니다. 이 정보를 바탕으로 저속노화를 위한 다음 식사의 피드백을 30자 이내로 작성하새요.
      
      ${userData ?
        `신체 정보: 나이 ${age}세, 키 ${userData.height}cm, 몸무게 ${userData.weight}kg` :
        `사용자 신체 정보: 정보 없음`
      }
        
        현재 먹은 식단 정보: ${foodList}
        현재 먹은 식단의 총 칼로리: ${mealData.total.kcal} kcal
        현재 먹은 식단의 영양성분: 탄수화물 ${mealData.total.carbohydrate}g, 단백질 ${mealData.total.protein}g, 지방 ${mealData.total.fat}g,
        식이섬유 ${mealData.total.fiber}g, 당류 ${mealData.total.sugar}g, 나트륨 ${mealData.total.sodium}mg

        현재 식사를 제외한 오늘의 식사 누적 영양성분: 탄수화물 ${cumulative.totalNutrition.carbohydrate}g, 단백질 ${cumulative.totalNutrition.protein}g, 
        지방 ${cumulative.totalNutrition.fat}g, 식이섬유: ${cumulative.totalNutrition.fiber}g, 당류: f${cumulative.totalNutrition.sugar}g, 나트륨 ${cumulative.totalNutrition.sodium}mg

        다음 지시사항을 반드시 지켜주세요.:
        피드백은 단순한 식단 평가와 세부 출력 사항으로 구분됩니다.

        단순한 식단 평가
        1. 사용자의 식단 평가를 처음 시작 말을 '[나쁨/좋음/보통].' 형식으로 출력해주세요. [나쁨/좋음/보통] 은 사용자의 신체정보와 현재 누적된 영양성분을 배경으로 구체적인 영향학적 기준으로 실행합니다. 이 뒤에 줄 바꿈(개행)을 두 번만 사용합니다.
        2. 나머지 출력은 아래의 세부 섹션으로 구성합니다.

        세부 출력 사항
        1. 개선사항의 경우, 저속노화를 위해 다음 식사에는 어떤 영양분이 부족하고 필요한지 명시해주세요.
        2. 무엇이 부족하고 다음에는 뭘 추천하는지 간략하게 30자 이내로 작성하세요.
        3. 답변에 '**'와 같은 굵은 글씨 표시는 사용하지 마세요.
        4. 한 문장이 끝나면 한번의 줄바꿈을 하세요.
        `;

    // DeepSeek API 호출
    const res = await fetch(`https://api.deepseek.com/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.REACT_APP_DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        stream: false,
      }),
    });

    if (!res.ok) {
      console.error("DeepSeek API 오류:", res.status, await res.text());
      throw new Error("DeepSeek 피드백 생성 실패");
    }

    const data = await res.json();
    setDailyFeedbackText(data.choices[0].message.content);
  } catch (err) {
    console.error("FeedbackPage >> DeepSeek 피드백 요청 실패:", err);
    setDailyFeedbackText("건강한 식사를 섭취하세요.");
  }
};


return (
  <div className="h-screen bg-white">
    <div className="max-w-xl mx-auto px-4">
      <div className="text-right">
        <button
          onClick={() => navigate("/main", { state: { selectedDate: selectedDate } })}
          className="mt-4 text-gray-500 hover:text-red-600 text-2xl font-bold"
        >
          ×
        </button>
      </div>

      <h1 className="text-lg font-semibold mb-5">식사 피드백</h1>

      <div className="p-4 bg-white shadow border border-[#587650] rounded">
        <h2 className="text-lg font-bold mb-2">총 {nutrients.total?.kcal} kcal</h2>

        <div className="mb-4 border border-gray-300 rounded px-8">
          <span className="text-sm text-center font-semibold block mb-4 my-2">섭취한 탄단지 비율</span>

          <div className="flex justify-between items-center mb-2 px-8">
            <div className="flex items-center gap-1">
              <span className="text-sm">탄수화물 {notPointnutrientRatio.carb}%</span>
              <div className="w-3 h-3 rounded-full bg-lime-600" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm">단백질 {notPointnutrientRatio.protein}%</span>
              <div className="w-3 h-3 rounded-full bg-yellow-600" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm">지방 {notPointnutrientRatio.fat}%</span>
              <div className="w-3 h-3 rounded-full bg-red-700" />
            </div>
          </div>

          <div className="flex h-3 rounded overflow-hidden mb-4 border border-gray-300">
            <div
              className="bg-lime-600"
              style={{ width: `${nutrientRatio.carb}%` }}
              title={`탄수화물 ${nutrientRatio.carb.toFixed(1)}%`}
            />
            <div
              className="bg-yellow-500"
              style={{ width: `${nutrientRatio.protein}%` }}
              title={`단백질 ${nutrientRatio.protein.toFixed(1)}%`}
            />
            <div
              className="bg-red-700"
              style={{ width: `${nutrientRatio.fat}%` }}
              title={`지방 ${nutrientRatio.fat.toFixed(1)}%`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 p-3 mb-4 border border-gray-300 rounded">
          {nutrients.total &&
            displayLabels.map(({ key, label, unit }, idx) => (
              <div key={idx}>
                {label} <strong>{nutrients.total[key]}</strong>
                <span className="ml-1">{unit}</span>
              </div>
            ))}
        </div>

        {/* 피드백 표시 부분 */}
        <div className="p-3 bg-gray-50 rounded border border-gray-300">

          <span className="text-sm text-center font-semibold block mb-4 my-2">식단 피드백</span>
          {isLoading || isUserInfoLoading ? (
            <span className="text-center"><DotLoading text="AI가 피드백을 생성 중입니다." /></span>
          ) : (
            <div className="whitespace-pre-line">{feedbackText}</div>
          )}

        </div>
      </div>

      <div>
        <button
          disabled={isLoading}
          onClick={saveMeal}
          className="block px-4 py-2 border border-[#8A9352]
                 bg-[#8A9352] hover:bg-[#6B8E23]
                 text-white font-semibold rounded w-fit mx-auto mt-4"
        >
          저장하기
        </button>

        {isLoading && (
          <div className="flex items-center justify-center text-sm mt-2">
            <TriangleAlert className="text-lime-700" />
            <p className="ml-2 text-lime-700">
              잠시만 기다려주세요.
            </p>
          </div>
        )}
      </div>

      {showAlertModal && <AlertModal alert={alertSentence} checkHandle={() => setShowAlertModal(false)} />}
    </div>
  </div >
);
};

export default FeedbackPage;