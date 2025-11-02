import { Laugh, Angry, Annoyed, Smile } from "lucide-react";

export const feedbackPresets = {
    good: {
      emoji: <Laugh className="w-5 h-5 text-lime-600" />,
    },
    bad: {
      emoji: <Angry className="w-5 h-5 text-red-700" />,
    },
    average: {
      emoji: <Annoyed className="w-5 h-5 text-yellow-600" />,
    },
    default: {
      emoji: <Smile className="w-5 h-5" />,
      defaultMessage: "건강한 식단! 맛있는 식단!",
    }
  };
  