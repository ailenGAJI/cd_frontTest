import React from "react";
import { feedbackPresets } from "../constants/feedbackPresets";
import { Laugh, Meh, Angry } from "lucide-react";

const FeedbackMessage = ({ dailyFeedbackText }) => { // props에 기본값 제거

    console.log("FeedbackMessage에 내려주는 데이터:", dailyFeedbackText);

    const type  = "default";
    const message = dailyFeedbackText ?? "건강한 식사, 좋은 식사!";
    const { emoji } = feedbackPresets[type] ?? feedbackPresets["default"];

    return (
        <div className="flex items-center justify-center my-4">
            <span className="text-2xl mr-2">{emoji}</span>
            <div className="rounded-lg p-3 shadow text-sm leading-5 whitespace-pre-line">
                {message}
            </div>
        </div>
    );
};

export default FeedbackMessage;