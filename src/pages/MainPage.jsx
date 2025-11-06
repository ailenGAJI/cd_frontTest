import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useModel } from "../context/ModelContext";
import HeaderDatePicker from "../components/HeaderDatePicker";
import FeedbackMessage from "../components/FeedbackMessage";
import MealSectionCard from "../components/MealSectionCard";
import BottomNavBar from "../components/BottomNavBar";
import StartInfoModal from "../components/modal/StartInfoModal";
import axios from "axios";
import DateSaveMeal from '../components/DateSaveMeal';

const MainPage = () => {

  const API_URL = process.env.REACT_APP_API_BASE_URL;

  const getUserBodyUrl = `${API_URL}/user/body`;
  const getMealImagesUrl = `${API_URL}/meal/images`;
  const getDailyFeedbackUrl = `${API_URL}/daily-nutrition`;

  const navigate = useNavigate();
  const location = useLocation(); // location 객체를 사용하기 위해 추가
  const { model } = useModel();

  // 백엔드에서 받은 식단 정보 배열
  const [meals, setMeals] = useState([]);
  const [userData, setUserData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isWeight, setIsWeight] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyFeedbackText, setDailyFeedbackText] = useState("건강한 식사, 좋은 식사!");


  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [mealDelList, setmealDelList] = useState([]);

  //(아직 구현 X )임시 상태 체크: 좋음, 보통, 나쁨
  const [condition, setCondition] = useState("default");


  // 네비게이션 상태에 날짜가 있으면 그 날짜를, 없으면 오늘 날짜를 사용
  const offset = new Date().getTimezoneOffset() * 60000;
  const [selectedDate, setSelectedDate] = useState(() => {
    const navDate = location.state?.selectedDate;
    if (navDate) { return navDate; }
    return new Date(Date.now() - offset).toISOString().split("T")[0];
  });

  // location.state 값이 바뀔 때만 실행될 useEffect 추가
  useEffect(() => {
    const navDate = location.state?.selectedDate;
    if (navDate) {
      setSelectedDate(navDate);
    }
  }, [location.state?.selectedDate, setSelectedDate]);

  //식사 삭제
  const delHandle = () => {
    setIsDeleteMode(!isDeleteMode);
    console.log(isDeleteMode);
  };


  const delServerHandle = async (selectedMealIds) => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await fetch(`${API_URL}/meal/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mealIds: selectedMealIds }),
      });

      if (!res.ok) {
        throw new Error(`서버 오류: ${res.status}`);
      }

      const result = await res.json();
      console.log("삭제 완료:", result);

      setMeals((prev) => prev.filter((meal) => !selectedMealIds.includes(meal._id)));
    } catch (err) {
      console.error("여러 식단 삭제 실패:", err.message);
    }
  };


  // 모델 확인: 모델이 로드되지 않았을 경우 로딩 페이지로 이동
  useEffect(() => {
    if (!model) {
      console.warn("MainPage LOG > 모델이 없어서 LoadingPage로 이동함");
      navigate("/loading");
    }
  }, [model, navigate]);

  // 삭제모드일때 렌더링
  useEffect(() => {
  }, [isDeleteMode]);

  // dailyFeedbackText, meal 바뀔 때마다 렌더링
  useEffect(() => {
  }, [meals, dailyFeedbackText]);



  // 백엔드에서 해당 날짜의 meal 가져오기
  const fetchTodayMealImages = useCallback(async (date) => {
    try {
      const res = await fetch(`${API_URL}/meal/images?date=${date}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data = await res.json();
      setMeals(data); // 백엔드에서 받은 데이터로 meals 상태 업데이트
      console.log("MainPage >> 해당 날짜의 meal data 확인: ", data);

    } catch (err) {
      console.error("MainPage LOG > 오늘 식단 이미지 불러오기 실패:", err);
      setMeals([]); // 실패 시 빈 배열로 설정
    }
  }, [getMealImagesUrl]);


  // 백엔드에서 해당 날짜의 dailyFeedback 가져오기
  const fetchDailyFeedback = useCallback(async (date) => {
    try {
      const res = await fetch(`${getDailyFeedbackUrl}/dailyFeedback/${date}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!res.ok) {
        if (res.status === 404) {
          console.log("해당 날짜의 dailyFeedback 없음");
          setDailyFeedbackText("건강한 식사, 좋은 식사!");
          return;
        }
        throw new Error(`서버 오류: ${res.status}`);
      }

      const data = await res.json();

      if (data.dailyFeedback != null) {
        setDailyFeedbackText(data.dailyFeedback);
        console.log("dailyFeedback 데이터: ", dailyFeedbackText);
      } else {
        setDailyFeedbackText("건강한 식사, 좋은 식사!");
      }

    } catch (err) {
      console.error("🚨 dailyFeedback 불러오기 실패:", err);
      setDailyFeedbackText(null);
    }
  }, [getDailyFeedbackUrl]);

  // 날짜 선택 핸들러
  const handleDateChange = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    // 날짜가 변경될 때마다 식단 정보 및 한줄 피드백 재요청
    fetchTodayMealImages(dateStr);
    fetchDailyFeedback(dateStr);
  };

  // 사용자 정보 및 식단 정보 동시 로딩
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchUser(); // 사용자 정보 먼저 가져오기
      await fetchTodayMealImages(selectedDate); // 날짜에 맞는 식단 정보 가져오기
      await fetchDailyFeedback(selectedDate); // 날짜에 맞는 한줄 피드백 가져오기
      setIsLoading(false);
    };
    loadData();
    console.log("신체정보 존재 확인용:", isWeight);
    console.log("로딩 중 확인용: ", isLoading);
  }, [selectedDate, fetchTodayMealImages, fetchDailyFeedback]); // selectedDate가 변경될 때마다 재실행


  // 신체정보 확인 함수
  const fetchUser = async () => {
    try {
      const res = await fetch(getUserBodyUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data = await res.json();
      setUserData(data);

      
      const isMissingInfo = !data || !data.weight || !data.height || !data.birthYear;

      console.log(data);

      if (isMissingInfo) {
        setIsWeight(false);
        console.log("신체정보 없음");
      } else {
        setIsWeight(true);
        console.log("신체정보 있음");
      }
    } catch (err) {
      console.error("사용자 정보 가져오기 실패:", err);
      throw err;
    }
  };


  // 모달 입력 후 데이터 업데이트
  const handleInputData = () => {
    fetchUser();
    setShowModal(false);
  };


  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white px-4">
        {/* 날짜 선택 */}
        <div className="w-full shadow-sm">
           <HeaderDatePicker selectedDate={selectedDate} onDateChange={handleDateChange} />
        </div>

        {/* 한 줄 피드백 메시지 */}
        <FeedbackMessage dailyFeedbackText={dailyFeedbackText} />

        {/* 식사 객체 */}
        <div className="relative">
          <MealSectionCard
            selectedDate={selectedDate}
            meals={meals}
            isDeleteMode={isDeleteMode}
            onDeleteHandle={delServerHandle}
          />
          {!isLoading && !isWeight && (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-yellow-500 text-white rounded-lg shadow-md"
              >
                신체 정보를 입력해주세요
              </button>
            </div>
          )}
          <div className="flex justify-end mt-4">
            <button
              onClick={() => delHandle()}
              className={`px-4 py-2 border rounded ${isDeleteMode
                ? "bg-[#8A9352] text-white border-[#8A9352]" // true일 때 초록색
                : "bg-white text-black border-[#8A9352]" // false일 때 흰색
                }`}
            >
              식사 삭제
            </button>
          </div>
        </div>
        {showModal && <StartInfoModal onClose={handleInputData} />}
      </div>
      <BottomNavBar />
    </div>
  );
};

export default MainPage;