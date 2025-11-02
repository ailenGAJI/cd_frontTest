import React from "react";

const CircularLoading = ({ value }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      {/* 제목 */}
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6">
        Loading Model...
      </h2>

      {/* 원형 로딩 애니메이션 */}
      <div className="relative w-24 h-24 mb-4">
        {/* 회전 바깥 원 */}
        <div className="absolute inset-0 border-4 border-[#1a691a] border-t-transparent rounded-full animate-spin"></div>
        {/* 가운데 숫자 */}
        <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-600">
          {value}%
        </div>
      </div>
    </div>
  );
};

export default CircularLoading;
