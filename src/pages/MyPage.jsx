import React, { useState } from "react";
import BottomNavBar from "../components/BottomNavBar";
import WeightModal from "../components/modal/WeightModal";
import UserInfoModal from "../components/modal/UserInfoModal"
import AlertModal from "../components/modal/AlertModal"
import axios from "axios";


const MyPage = () => {

  const API_URL = process.env.REACT_APP_API_BASE_URL;

  const [showWeightModal, setShowWeightModal] = useState(false);
  const [userInfoModal, setUserInfoModal] = useState(false);
  const [deleteModal, setDeletModal] = useState(false);

  const deleteUserAlert = "삭제하시겠습니까? \n 사용자의 모든 정보가 지워집니다.";

  const deleteUser = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.delete(`${API_URL}/user/delete`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("탈퇴 성공:", res.data);

      // 성공 처리 (토큰 삭제 & 메인 페이지로 이동)
      localStorage.removeItem("accessToken");
      window.location.href = "/";

      return res.data; // 결과 반환
    } catch (err) {
      console.error("탈퇴 실패:", err);
      return null;
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="px-4 bg-white">
        {/* 상단 콘텐츠 */}

        <div className="flex flex-col px-4 pt-6">
          <h1 className="text-lg font-semibold mb-5">마이페이지</h1>

          <div className="space-y-3">
            <button className="w-full py-3 px-4 bg-[#fcba03] text-gray-800 rounded-md shadow-sm text-sm text-left"
              onClick={() => setShowWeightModal(true)}>
              신체 정보 수정
            </button>

            <button className="w-full py-3 px-4 bg-[#fcba03] text-gray-800 rounded-md shadow-sm text-sm text-left"
              onClick={() => setUserInfoModal(true)}>
              가입 정보
            </button>
          </div>
        </div>
        {showWeightModal && <WeightModal onClose={() => setShowWeightModal(false)} />}
        {userInfoModal && <UserInfoModal onClose={() => setUserInfoModal(false)} />}
        {deleteModal && <AlertModal alert={deleteUserAlert} checkHandle={() => deleteUser()} noCheckHandle={() => setDeletModal(false)} />}
      </div>

      <div className="fixed bottom-16 w-full max-w-xl mx-auto px-4 py-3 bg-white">
        <button className="w-full text-sm text-gray-400"
          onClick={() => setDeletModal(true)}>
          탈퇴하기
        </button>
      </div>

      {/* 하단 네비게이션 바 */}
      <BottomNavBar />
    </div>

  );
};

export default MyPage;