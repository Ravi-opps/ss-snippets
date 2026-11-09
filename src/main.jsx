import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import KafkaPage from "./KafkaPage.jsx";
import "./styles.css";

const path = window.location.pathname.replace(/\/+$/, "");
const isKafkaRoute = /(^|\/)kafka$/i.test(path);

function Root() {
  return isKafkaRoute ? <KafkaPage /> : <App />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
