import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from "./pages/LoginPage";
import LoadingPage from "./pages/LoadingPage";
import MainPage from "./pages/MainPage";
import ResultPage from "./pages/ResultPage";
import AnalyzingPage from "./pages/AnalyzingPage";
import CalendarPage from "./pages/CalendarPage";
import FeedbackPage from "./pages/FeedbackPage";
import MyPage from "./pages/MyPage";

function App() {
  return (
    <Routes>
      {/* 로그인*/}
      <Route path="/" element={<LoginPage />} />
      <Route path="/loading" element={<LoadingPage />} />

      {/*앱 페이지*/}
      <Route element={<ProtectedRoute />}>
        <Route path="/main" element={<MainPage />} />
        <Route path="/analyzing" element={<AnalyzingPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/myPage" element={<MyPage />} />
        <Route path="/Feedback" element={<FeedbackPage />} />
      </Route>
    </Routes>
  );
}

export default App;
