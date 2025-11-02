import React from "react";
import { HandPlatter } from 'lucide-react';

const DateSaveMeal = ({ saveMealList }) => {
  const mealList = saveMealList?.meals || [];
  console.log("DataSaveMEal 확인용: ", mealList);

  if (mealList.length === 0) {
    return (
      <div className="border border-gray-300 rounded-xl p-4 shadow-sm bg-white text-center">
        <p>기록된 식단이 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      {mealList.map((meal, index) => (
        <div key={index} className="flex items-center border border-gray-300 rounded-xl p-4 shadow-sm bg-white mb-4">

          {/* 왼쪽: 이미지 컨테이너 */}
          <div className="flex-shrink-0 mr-4">
            <img
              src={meal.imageUrl || <HandPlatter className="w-10 h-10 text-green-500" />}
              alt="식단 이미지"
              className="w-20 h-20 rounded-lg object-cover"
            />
          </div>

          {/* 오른쪽: 정보 컨테이너 */}
          <div className="flex-grow">
            {/* 시간 정보 */}
            <p className="font-bold text-lg">{meal.time}</p>
            {/* 음식 이름들 */}
            <p className="text-gray-600 text-sm">
              {
                meal.foodItems
                  ?.map(item => item.name)
                  .join(', ')
              }
            </p>
            {/* 피드백 정보 */}
            <p className="whitespace-pre-line mt-2 text-sm text-gray-400">
              {meal.feedback}
            </p>
          </div>

        </div>
      ))}
    </div>
  );
};

export default DateSaveMeal;