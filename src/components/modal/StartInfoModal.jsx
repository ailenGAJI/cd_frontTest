import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const StartInfoModal = ({ onClose }) => {


    const API_URL = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();

    // 상태관리
    const [birthYear, setBirthYear] = useState("");
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");
    const [sex, setSex] = useState("");
    const activityLevels = [
        { key: "1.2", label: "운동 거의 없음(좌식생활)" },
        { key: "1.375", label: "가벼운 운동 (주 1~3회)" },
        { key: "1.55", label: "보통 운동 (주 3~5회)" },
        { key: "1.725", label: "강도 높은 운동 (주 6~7회)" },
        { key: "1.9", label: "매우 활동적 (육체 노동, 선수급 훈련)" }
    ];
    const [selectedActivityLevel, setSelectedActivityLevel] = useState("1.2");

    // 서버에 전송
    const sendDataToServer = async () => {
        try {
            const res = await fetch(`${API_URL}/user/body`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
                },
                body: JSON.stringify({
                    birthYear,
                    weight,
                    height,
                    sex,
                    selectedActivityLevel,
                }),
            });

            console.log(localStorage.getItem("accessToken"));

            if (!res.ok) {
                throw new Error("전송 실패");
            }

            const result = await res.json();
            console.log("서버 응답:", result);
            return true;
        } catch (err) {
            console.error("전송 실패:", err);
            return false;
        }
    };

    // 확인 버튼
    const handleSubmit = async () => {
        const success = await sendDataToServer();
        if (success) {
            onClose(); // 모달 닫기
            navigate("/main"); // 메인으로 이동
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-80 shadow-lg">

                <h2 className="text-lg font-semibold mb-4">기본 정보 입력</h2>

                {/* 성별 설정 */}
                <div className="flex items-center mb-2">
                    <div className="flex space-x-4 mb-2">
                        <span className="w-20 text-gray-700">성별 선택:</span>
                        <label>
                            <input
                                type="radio"
                                name="sex"
                                value="female"
                                checked={sex === "female"}
                                onChange={(e) => setSex(e.target.value)}
                            />
                            여성
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="sex"
                                value="male"
                                checked={sex === "male"}
                                onChange={(e) => setSex(e.target.value)}
                            />
                            남성
                        </label>
                    </div>
                </div>

                {/* 출생연도 */}
                <div className="flex items-center mb-3">
                    <span className="w-24 text-gray-700">출생년도:</span>
                    <input
                        type="number"
                        value={birthYear}
                        onChange={(e) => setBirthYear(e.target.value)}
                        className="w-32 border px-3 py-2 rounded"
                    />
                    <span className="ml-2 text-gray-700">년</span>
                </div>

                {/* 몸무게 */}
                <div className="flex items-center mb-3">
                    <span className="w-24 text-gray-700">몸무게:</span>
                    <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-32 border px-3 py-2 rounded"
                    />
                    <span className="ml-2 text-gray-700">kg</span>
                </div>

                {/* 키 */}
                <div className="flex items-center mb-5">
                    <span className="w-24 text-gray-700">키:</span>
                    <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="w-32 border px-3 py-2 rounded"
                    />
                    <span className="ml-2 text-gray-700">cm</span>
                </div>

                <div>
                    <hr class="border-t border-dashed border-gray-400 my-4" />
                </div>

                {/* 활동 계수 */}
                <div className="flex flex-col mb-5">
                    <span className="text-gray-700 mb-1">평상 시 활동을 선택해주세요.</span>
                    <select
                        value={selectedActivityLevel}
                        onChange={(e) => setSelectedActivityLevel(e.target.value)}
                        className="text-sm border border-[#8A9352] px-1 py-1 rounded"
                    >
                        {activityLevels.map((level) => (
                            <option key={level.key} value={level.key}>
                                {level.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 버튼 */}
                <div className="flex justify-end space-x-2">
                    <button
                        className="px-4 py-2 bg-gray-200 rounded"
                        onClick={onClose}
                    >
                        취소
                    </button>
                    <button
                        className="px-4 py-2 bg-[#d6b454] rounded text-white font-semibold"
                        onClick={handleSubmit}
                        disabled={!birthYear || !weight || !height || !sex}
                    >
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StartInfoModal;