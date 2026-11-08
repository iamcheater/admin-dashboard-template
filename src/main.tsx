import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { getToken } from "./auth/session";
import { startTheme } from "./lib/theme";
import { getProfile } from "./redux/actions/auth";
import { Providers } from "./redux/provider";
import store from "./redux/store";
import "./styles/main.scss";
import App from "./App.tsx";

startTheme();

if (getToken()) void store.dispatch(getProfile());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
);
