import React from "react";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

const HeaderDatePicker = ({ selectedDate, onDateChange }) => {
  return (
    <div className="text-center text-sm text-gray-600 mt-2">
      <DatePicker
        selected={new Date(selectedDate)}
        onChange={(date) => onDateChange(date)}
        customInput={
          <button className="text-center font-semibold">
            {format(new Date(selectedDate), "yyyy년 MM월 dd일")}
          </button>
        }
      />
    </div>
  );
};

export default HeaderDatePicker;
