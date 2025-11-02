// 모든 페이지에서 model이 접근가능하도록 하는 컴포넌트
import React, { createContext, useContext, useState } from "react";

//모델 관련 저장소 context 객체 생성
const ModelContext = createContext(null);
export const useModel = () => useContext(ModelContext);

//커스텀 훅 생성: 데이터 공급 컴포넌트
export const ModelProvider = ({ children }) => {
  const [model, setModel] = useState(null); // model 안에 inputShape가 이미 포함됨

  return (
    <ModelContext.Provider value={{ model, setModel }}>
      {children}
    </ModelContext.Provider>
  );
};