import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./Images.css";
import App from "./App.jsx";

const isAdmin = window.location.pathname.startsWith("/admin");

if (isAdmin) {
  import("./pages/admin/AdminApp.jsx").then(({ default: AdminApp }) => {
    createRoot(document.getElementById("root")).render(
      <StrictMode>
        <AdminApp />
      </StrictMode>,
    );
  });
} else {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
