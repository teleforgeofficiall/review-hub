import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { TMAProvider } from "./components/TMAProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TMAProvider>
      <App />
    </TMAProvider>
  </StrictMode>
);
