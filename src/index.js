import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { ModelProvider } from "./context/ModelContext"; //모델 전역 사용 context API
import './styles/radio.css';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  //<React.StrictMode> : 모델 두번 돌리는 것 방지를 위한 주석처리
  <BrowserRouter>
    <ModelProvider>
      <App />
    </ModelProvider>
  </BrowserRouter>
  //</React.StrictMode>
);
