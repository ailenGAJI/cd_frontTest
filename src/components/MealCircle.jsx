import React from "react";
import defaultImage from "../assets/default_meal.jpeg";
import { SquareX } from "lucide-react";

const getBorderClass = (colorLevel) => {
  if (colorLevel === "green") return "border-4 border-green-500";
  if (colorLevel === "yellow") return "border-4 border-yellow-400";
  if (colorLevel === "red") return "border-4 border-red-500";
  return ""; // 유효한 colorLevel이 아니면 빈 문자열 반환
};

const MealCircle = ({ mealId, imageUrl, time, colorLevel, isDeleteMode, onDeleteHandle }) => {

  console.log("MealCircle 확인 >> " ,isDeleteMode )
  const handleImageError = (e) => {
    e.target.src = defaultImage;
  };

  return (
    <div className="flex flex-col items-center group">
      <div className={`w-24 h-24 rounded-full overflow-hidden 
        ${getBorderClass(colorLevel)} 
        transition-transform duration-300 group-hover:scale-110 bg-white`}>
        <img
          src={imageUrl || defaultImage}
          onError={handleImageError}
          alt="meal"
          className="w-full h-full object-cover"
        />
      </div>
      <p className="text-xs mt-2">{time}</p>

      {isDeleteMode && (
        <button className="mt-2 hover:scale-125 transition-transform"
        onClick={() => {onDeleteHandle([mealId]); console.log(mealId);}}>
        <SquareX size={20} />
        </button>
      )}
    </div>
  );
};

export default MealCircle;
