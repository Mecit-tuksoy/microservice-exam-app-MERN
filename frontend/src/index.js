import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css"; // global stiller, eğer varsa

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
