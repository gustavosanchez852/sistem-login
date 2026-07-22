import React, { useState, useEffect } from "react";

const API_URL = `${process.env.REACT_APP_API_URL}/api`;

const ArchivosPage = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState(""); // Estado para mensajes de la UI
  const [isLoading, setIsLoading] = useState(false); // Estado de carga

  useEffect(() => {
    fetchFiles();
  }, []);

  // Función auxiliar para manejar las peticiones
  const apiCall = async (endpoint, options) => {
    setIsLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${API_URL}${endpoint}`, options);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error en la petición.");
      }
      return await response.json();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      console.error(`Error en la petición a ${endpoint}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFiles = async () => {
    const data = await apiCall("/files");
    if (data && data.files) {
      setFiles(data.files);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setMessage("Por favor, selecciona un archivo primero.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    const data = await apiCall("/files/upload", {
      method: "POST",
      body: formData,
    });

    if (data) {
      setMessage("Archivo subido con éxito. 🎉");
      setSelectedFile(null);
      document.getElementById("fileInput").value = "";
      fetchFiles();
    }
  };

  const handleFileDownload = (filename) => {
    window.open(`${API_URL}/files/download/${filename}`, "_blank");
  };

  const handleFileDelete = async (filename) => {
    if (
      window.confirm(`¿Estás seguro de que quieres eliminar "${filename}"?`)
    ) {
      const data = await apiCall(`/files/${filename}`, {
        method: "DELETE",
      });
      if (data) {
        setMessage("Archivo eliminado con éxito.🗑️");
        fetchFiles();
      }
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Gestión de Archivos</h1>

      {message && (
        <p
          style={{
            color: message.startsWith("Error") ? "red" : "green",
            fontWeight: "bold",
          }}
        >
          {message}
        </p>
      )}
      {isLoading && <p>Cargando... ⏳</p>}

      <div
        style={{
          marginBottom: "20px",
          border: "1px solid #ccc",
          padding: "15px",
        }}
      >
        <h2>Subir Nuevo Archivo</h2>
        <input id="fileInput" type="file" onChange={handleFileChange} />
        <button
          onClick={handleFileUpload}
          disabled={isLoading || !selectedFile}
          style={{ marginLeft: "10px" }}
        >
          {isLoading ? "Subiendo..." : "Subir Archivo"}
        </button>
      </div>

      <h2>Archivos Subidos</h2>
      {isLoading && !files.length ? (
        <p>Cargando lista de archivos...</p>
      ) : files.length === 0 ? (
        <p>No hay archivos subidos.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                Nombre del Archivo
              </th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, index) => (
              <tr key={index}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {file}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  <button onClick={() => handleFileDownload(file)}>
                    Descargar
                  </button>
                  <button
                    onClick={() => handleFileDelete(file)}
                    style={{ marginLeft: "5px" }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ArchivosPage;
