import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('accessToken');
  
  // 토큰이 없으면 로그인 페이지로 리디렉션
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  // 토큰이 있으면 자식 컴포넌트(원래 페이지) 보여주기
  return <Outlet />;
};

export default ProtectedRoute;