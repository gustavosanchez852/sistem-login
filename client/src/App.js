// client/src/App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import DashboardPage from "./components/DashboardPage";
import PrivateRoute from "./components/PrivateRoute";
import Articulos from "./components/ArticulosPage";
import ArchivosPage from "./components/ArchivosPage";
import PagosPage from "./components/PagosPage";
import "./App.css";

// Componente para el botón de cambio de tema
const ThemeToggleButton = ({ theme, toggleTheme }) => {
  return (
    <button onClick={toggleTheme} className="theme-toggle-button">
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
};

function App() {
  // Lógica para gestionar el tema
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    // Aplica la clase al body y guarda en localStorage
    document.body.className = theme === "dark" ? "dark-mode" : "";
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };
  return (
    <Router>
      <div className="container">
        <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />
          <Route path="/articulos" element={<Articulos />} />
          <Route path="/archivos" element={<ArchivosPage />} />
          <Route path="/pagos" element={<PagosPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
