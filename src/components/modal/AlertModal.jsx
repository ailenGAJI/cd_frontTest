// 경고창 모달

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AlertModal = ({ alert, checkHandle, noCheckHandle }) => {

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-80 shadow-lg">

                <div className="mb-2">
                    <h2 className="text-lg text-center font-semibold mb-4">경고</h2>
                    <h2 className="whitespace-pre-line">{alert}</h2>
                </div>

                <div className="flex justify-end space-x-2">
                    <button
                        className="px-4 py-2 border border-[#8A9352] bg-[#8A9352] hover:bg-[#6B8E23] text-white font-semibold rounded w-fit mt-4 mb-4"
                        onClick={checkHandle}
                    >
                        확인
                    </button>

                    {noCheckHandle && ( // noHandle이 존재할 때만 버튼을 렌더링
                        <button
                            className="px-4 py-2 border border-[#8A9352] bg-[#8A9352] hover:bg-[#6B8E23] text-white font-semibold rounded w-fit mt-4 mb-4"
                            onClick={noCheckHandle}
                        >
                            취소
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AlertModal;
