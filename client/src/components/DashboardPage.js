// src/components/DashboardPage.js
import React from "react";
import { useNavigate } from "react-router-dom";

// Importa las imágenes que usarás para cada botón.
import articulosIcon from "../assets/articulos.png";
import archivosIcon from "../assets/archivos.png";
import pagosIcon from "../assets/pagos.png";

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Elimina el token del localStorage para cerrar la sesión
    localStorage.removeItem("token");
    // Redirige al usuario a la página de login
    navigate("/login", { replace: true });
  };

  const handleNavigation = (path) => {
    // Esta función nos ayudará a navegar a la ruta deseada
    navigate(path);
  };

  const dashboardItems = [
    {
      path: "/articulos",
      label: "Artículos (CRUD)",
      icon: articulosIcon,
      alt: "Icono de Artículos",
    },
    {
      path: "/archivos",
      label: "Archivos (Subir/Descargar)",
      icon: archivosIcon,
      alt: "Icono de Archivos",
    },
    {
      path: "/pagos",
      label: "Procesar Pagos",
      icon: pagosIcon,
      alt: "Icono de Pagos",
    },
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Dashboard</h2>
        <button className="logout-button" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </header>

      <p className="welcome-message">
        ¡Bienvenido! Selecciona una opción para continuar.
      </p>

      <div className="button-grid">
        {dashboardItems.map((item) => (
          <button
            key={item.path}
            className="dashboard-card"
            onClick={() => handleNavigation(item.path)}
          >
            <img src={item.icon} alt={item.alt} />
            <span className="card-text">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
