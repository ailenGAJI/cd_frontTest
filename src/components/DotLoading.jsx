import React, { useState, useEffect } from "react";

const DotLoading = ({ text = "기다려주세요"}) => {
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev >= 3 ? 1 : prev + 1));
    }, 500);
    return () => clearInterval(interval); //메모리 누수 방지: 컴포넌트가 사라질 때, 멈추기
  }, []);

  return (
    <p className="animate-pulse">
      {text}
      {".".repeat(dotCount)}
    </p>
  );
};

export default DotLoading;
