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
        </div>

        <DateSaveMeal saveMealList={mealList} />

      </div>
      <BottomNavBar />
    </div>

  );
};

export default CalendarPage;