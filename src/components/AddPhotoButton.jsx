import React from "react";
import { useNavigate } from "react-router-dom";

const AddPhotoButton = ({ selectedDate }) => {

  const fileInputRef = React.useRef();
  const navigate = useNavigate();
  

  //커스텀 버튼: 이벤트 지정
  const handleClick = () => {
    fileInputRef.current && fileInputRef.current.click();
  };

  //실제 버튼 발생 이벤트
  const handleChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();

      //파일을 다읽고 나면 실행
      reader.onloadend = () => {
        const imageUrl = reader.result;
        if (!imageUrl) {
          alert("이미지를 불러오지 못했습니다.");
          return;
        }

        const mealTime = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        navigate("/analyzing", {
          state: {
            mealImage: imageUrl,
            mealTime,
            selectedDate,
          },
        });
      };


      reader.readAsDataURL(file); //비동기 함수, 실행이 끝나면 onloadend 리스너 알아서 실행
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="w-24 h-24 rounded-full border-2 border-[#6B8E23] text-3xl font-bold 
        flex items-center justify-center 
        transition-all duration-300 hover:scale-110"
      >
        <div className="text-[#6B8E23]">+</div>
      </button>
      <input
        type="file"
        accept="image/*,application/pdf"
        ref={fileInputRef}
        onChange={handleChange}
        className="hidden"
        //capture="camera"
      />
    </>
  );
};

export default AddPhotoButton;
