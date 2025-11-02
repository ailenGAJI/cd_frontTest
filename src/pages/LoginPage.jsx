// src/pages/LoginPage.jsx

import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {

  const API_URL = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  //토큰이 있을 경우, 바로 로딩화면 이동
  useEffect(() => {
    const savedToken = localStorage.getItem("accessToken");
    if (savedToken) {
      navigate("/loading");
    }
  }, []);

  const handleLogin = async (provider) => {
    // 카카오, 구글 로그인 처리
      window.location.href = `${API_URL}/auth/${provider}`;
  };



  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white px-4">
      <h1 className="text-3xl font-bold mb-7 text-gray-800">로그인/회원가입</h1>
      <h1 className="text-1xl mb-20 text-gray-500">저속노화를 위한 한걸음<br />건강한 섭취를 시작하세요.</h1>

      <button
        onClick={() => handleLogin("kakao")}
        className="w-full max-w-xs mb-4 py-3 bg-[#ffd700] text-black rounded shadow-md font-medium"
      >
        카카오톡 계정으로 시작하기
      </button>

      <button
        onClick={() => handleLogin("google")}
        className="w-full max-w-xs mb-20 py-3 bg-[#ff6347] text-black rounded shadow-md font-medium"
      >
        구글 계정으로 시작하기
      </button>

      <p className="text-xs text-gray-500 text-center px-4">
        회원가입 없이 이용 가능하며 첫 로그인 시{" "}
        <span className="text-[#228b22] underline">이용약관</span> 및{" "}
        <span className="text-[#228b22] underline">개인정보처리방침</span> 동의로 간주됩니다.
      </p>

      <button className="absolute bottom-4 text-sm text-gray-500" onClick={() => window.close()}>
        닫기
      </button>
    </div>
  );
};

export default LoginPage;