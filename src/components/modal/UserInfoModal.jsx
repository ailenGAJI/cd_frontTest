import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const StartInfoModal = ({ onClose }) => {

    const API_URL = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();

    // 상태관리
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userLoginInfo, setUserLoginInfo] = useState("");
    const [isSuccess, setIssuccess] = useState(false);


    // 서버 요청
    const fetchUserInfo = async () => {
        try {
            const token = localStorage.getItem("accessToken");

            const res = await axios.get(`${API_URL}/user/info`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = res.data;
            console.log("가입 정보:", res.data);
            if (data.user.username === undefined || data && (data.user.email === null || data.user.provider === undefined)) {
                setUserName("");
                setUserEmail("");
                setUserLoginInfo("");
            } else {
                setUserName(data.user.username);
                setUserEmail(data.user.email);
                setUserLoginInfo(data.user.provider);
            }

            return res.data; // 결과 반환

        } catch (err) {
            console.error("가입 정보를 불러오지 못했습니다:", err);
            return null;
        }
    };

    // 가입 정보 수정
    const updateUserInfo = async () => {
        try {
            const token = localStorage.getItem("accessToken");

            const res = await fetch(`${API_URL}/user/info`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
                    },
                    body: JSON.stringify({
                        username: userName,
                        email: userEmail
                    }),
                }
            );

            console.log("수정된 사용자 정보:", res.data);
            setIssuccess(true);
            return res.data;

        } catch (err) {
            console.error("사용자 정보 수정 실패:", err);
            return null;
        }
    };

    // 확인 버튼
    const handleSubmit = async () => {
        onClose(); // 모달 닫기
    };

    useEffect(() => {
        fetchUserInfo();
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-80 shadow-lg">

                <h2 className="text-lg font-semibold mb-4">사용자 정보</h2>

                {/* 이름 */}
                <div className="flex items-center mb-3">
                    <span className="w-24 text-gray-700">이름:</span>
                    <input
                        type="string"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-32 border px-3 py-2 rounded text-sm text-gray-500"
                    />
                    <button
                        className="ml-2 text-sm bg-[#d6b454] hover:bg-[#fcba03] rounded text-white"
                        onClick={updateUserInfo}>
                        수정
                    </button>
                </div>

                {/* 이메일 */}
                <div className="flex items-center mb-3">
                    <span className="w-24 text-gray-700">이메일:</span>
                    <input
                        type="string"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="w-32 border px-3 py-2 rounded text-sm text-gray-500"
                    />
                    <button
                        className="ml-2 text-sm bg-[#d6b454] hover:bg-[#fcba03] rounded text-white"
                        onClick={updateUserInfo}>
                        수정
                    </button>
                </div>

                {/* 제공 */}
                <div className="flex items-center mb-3 text-gray-700">
                    <span className="w-24"> 로그인 정보:</span>
                    <span className="w-33 text-sm px-3 py-2">{userLoginInfo} 로 로그인</span>
                </div>

                {/* 버튼 */}
                <div className="flex-col">
                    <div className="flex justify-end space-x-2">
                        <button
                            className="px-4 py-2 bg-[#d6b454] hover:bg-[#fcba03] rounded text-white font-semibold"
                            onClick={handleSubmit}
                            disabled={!userName}
                        >
                            확인
                        </button>
                    </div>

                    {isSuccess && (
                        <div className="flex justify-end text-sm mt-2">
                            <p className="ml-2 text-lime-700">
                                수정되었습니다.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StartInfoModal;