import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { DiscussionsProvider } from "./contexts/discussionsData";
import { BrowserRouter } from "react-router-dom";
import { ThirdwebProvider } from "thirdweb/react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThirdwebProvider>
      <BrowserRouter>
        <DiscussionsProvider>
          <App />
        </DiscussionsProvider>
      </BrowserRouter>
    </ThirdwebProvider>
  </StrictMode>
);
