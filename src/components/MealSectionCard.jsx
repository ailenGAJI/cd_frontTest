import React from "react";
import MealCard from "./MealCard";

const MealSectionCard = ({ meals = [], selectedDate, isDeleteMode, onDeleteHandle }) => {
  return (
    <div className="border border-gray-300 rounded-xl pt-7 pl-7 pr-7 shadow-sm bg-white">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold mr-2">오늘의 식사</h2>
        {isDeleteMode && (
          <button className="text-sm hover:scale-125 transition-transform"
            onClick={() => {
              onDeleteHandle(meals.map((meal) => meal._id));
            }}>
            전체 삭제
          </button>)}
      </div>
      <MealCard meals={meals} selectedDate={selectedDate} isDeleteMode={isDeleteMode} onDeleteHandle={onDeleteHandle} /> {/* 전달 */}
    </div>
  );
};

export default MealSectionCard;
