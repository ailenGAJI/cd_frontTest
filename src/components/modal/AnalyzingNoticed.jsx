// AlertModal.js 파일
import React from "react";
import DotLoading from "../DotLoading";

const AlertModal = ({ alert, onClose }) => {
    // alert.message를 이용해서 텍스트를 전달
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
                <div className="text-xl">
                    {/* alert 객체에서 message 속성을 가져와서 text prop으로 전달 */}
                    <DotLoading text={alert.message} /> 
                </div>

                <div className="flex justify-end space-x-2">
                    <button
                        className="px-4 py-2 bg-gray-200 rounded"
                        onClick={onClose}
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;