import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/calendar.css'
import { Laugh, Meh, Angry } from "lucide-react";
import DateSaveMeal from '../components/DateSaveMeal';
import BottomNavBar from '../components/BottomNavBar';
import axios from "axios";

const CalendarPage = () => {

  const [date, setDate] = useState(new Date());
  const [mealList, setMealList] = useState({});

  // 백엔드에서 받아와야 함
  const [monthlyStats, setMonthlyStats] = useState({ green: 0, yellow: 0, red: 0 });


  // 캘린더에서 날짜를 선택했을 때 백엔드 API 호출
  useEffect(() => {
    getMealsByDate(date);
  }, [date]); 

  //오늘 날짜에 불꽃 이모지
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;

    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    return isToday ? <span>🔥</span> : null;
  };

  //각 배율만큼 계산 함수
  const getBarWidth = (count) => {
    const total = monthlyStats.green + monthlyStats.yellow + monthlyStats.red;
    return total === 0 ? '0%' : `${(count / total) * 100}%`;
  };

  // 백엔드 호출을 위한 포맷 데이트
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    console.log(formattedDate);
    return formattedDate;
  };


  // 선택된 날짜에 대한 식단 데이터를 가져오는 함수
  const getMealsByDate = async (selectedDate) => {
    // 날짜 객체가 유효한지 먼저 확인
    if (!selectedDate || !(selectedDate instanceof Date)) {
      console.error("유효하지 않은 날짜 객체입니다.");
      return;
    }

    // `formatDate` 함수를 호출, API 요청 URL을 만듦
    const formattedDateString = formatDate(selectedDate);

    try {
      const res = await axios.get(`http://localhost:5000/api/meal/${formattedDateString}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      console.log("식단 호출 성공:", res.data);
      setMealList(res.data);
      
      return res.data;
    } catch (err) {
      console.error("식단 호출 실패:", err.response?.data || err.message);
      return null;
    }
  };


  return (
    <div className='max-w-xl mx-auto'>
      <div className="p-4 pb-16 px-4 bg-white">
        <Calendar
          tileContent={tileContent}
          className="w-full max-w-md mx-auto"
          onChange={setDate}
          value={date}
        />

        <div className="border border-gray-300 rounded-xl mt-6 mb-4 p-4">
          <div className="mb-2 text-sm">
            <p>{date.toDateString()}</p>
          </div>

          <div className="flex h-4 w-full rounded overflow-hidden">
            <div className="bg-green-500" style={{ width: getBarWidth(monthlyStats.green) }}></div>
            <div className="bg-yellow-400" style={{ width: getBarWidth(monthlyStats.yellow) }}></div>
            <div className="bg-red-400" style={{ width: getBarWidth(monthlyStats.red) }}></div>
          </div>

          <div className="flex justify-between text-sm mt-2">
            <span className="flex items-center gap-1 text-green-600">
              <Laugh className="w-5 h-5 text-green" /> {Math.round((monthlyStats.green / (monthlyStats.green + monthlyStats.yellow + monthlyStats.red || 1)) * 100)}%
            </span>
            <span className="flex items-center gap-1 text-yellow-600">
              <Meh className="w-5 h-5 text-Yellow" /> {Math.round((monthlyStats.yellow / (monthlyStats.green + monthlyStats.yellow + monthlyStats.red || 1)) * 100)}%
            </span>
            <span className="flex items-center gap-1 text-red-600">
              <Angry className="w-5 h-5 text-Yellow" /> {Math.round((monthlyStats.red / (monthlyStats.green + monthlyStats.yellow + monthlyStats.red || 1)) * 100)}%
            </span>
          </div>
        </div>

        <DateSaveMeal saveMealList={mealList} />

      </div>
      <BottomNavBar />
    </div>

  );
};

export default CalendarPage;