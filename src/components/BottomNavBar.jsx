import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUtensils, FaCalendarAlt, FaUser } from 'react-icons/fa';

const BottomNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="max-w-xl mx-auto px-4 fixed bottom-0 w-full h-16 bg-white border-t flex justify-around items-center">
      {/**첫번째 버튼: 메인화면 이동*/}
      <button onClick={() => navigate('/')} className="flex flex-col items-center">
        <FaUtensils size={24} className={isActive('/main') ? 'text-black' : 'text-gray-400'} />
      </button>

      {/**두번째 버튼: 캘린더 이동*/}
      <button onClick={() => navigate('/calendar')} className="flex flex-col items-center">
        <FaCalendarAlt size={24} className={isActive('/calendar') ? 'text-black' : 'text-gray-400'} />
      </button>

      {/**세번째 버튼: 마이페이지 이동*/}
      <button onClick={() => navigate('/myPage')} className="flex flex-col items-center">
        <FaUser size={24} className={isActive('/myPage') ? 'text-black' : 'text-gray-400'} />
      </button>
    </div>
  );
};

export default BottomNavBar;
