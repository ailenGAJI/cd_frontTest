import React from "react";
import MealCircle from "./MealCircle";
import AddPhotoButton from "./AddPhotoButton";

const MealCard = ({ meals = [], selectedDate, isDeleteMode, onDeleteHandle}) => {

  const mealList = Array.isArray(meals) ? meals : [];

  return (
    <div className="flex gap-4 overflow-x-auto p-2 h-44">
      {mealList.map((meal, idx) => (
        <MealCircle
          key={idx}
          mealId={meal._id} 
          imageUrl={meal.url}
          time={meal.time}
          colorLevel={meal.colorLevel}
          isDeleteMode={isDeleteMode}
          onDeleteHandle={onDeleteHandle}
        />
      ))}
      <div className="flex-shrink-0">
        <AddPhotoButton selectedDate={selectedDate} />
      </div>
    </div>
  );
};

export default MealCard;
