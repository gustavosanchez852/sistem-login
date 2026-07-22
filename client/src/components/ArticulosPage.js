// src/components/ArticulosPage.js

import React, { useState, useEffect } from "react";

const API_URL = `${process.env.REACT_APP_API_URL}/api/articulos`;

const ArticulosPage = () => {
  const [articulos, setArticulos] = useState([]);
  const [formState, setFormState] = useState({
    id: null,
    nombre: "",
    precio: "",
    cantidad: "",
    imagenBase64: "",
  });
  const [mode, setMode] = useState("list");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchArticulos();
  }, []);

  // Función auxiliar para manejar las peticiones a la API
  const apiCall = async (endpoint, options) => {
    setIsLoading(true);
    setMessage("");
    try {
      const response = await fetch(endpoint, options);
      if (!response.ok) {
        // Si la respuesta no es exitosa, intenta leer el error
        const errorData = response.headers
          .get("content-type")
          ?.includes("application/json")
          ? await response.json()
          : { message: `Error ${response.status}: ${response.statusText}` };
        throw new Error(errorData.message || "Error en la petición.");
      }
      // Si la respuesta es 204 No Content, no intentes leer el cuerpo
      if (response.status === 204) {
        return { success: true };
      }
      // Para otros casos exitosos, lee el JSON
      return await response.json();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      console.error(`Error en la petición:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchArticulos = async () => {
    const data = await apiCall(API_URL);
    if (data) {
      setArticulos(data);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1048576) {
        setMessage("El archivo es demasiado grande (máximo 1 MB).");
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setFormState((prevState) => ({
          ...prevState,
          imagenBase64: reader.result,
        }));
        setMessage("Imagen cargada correctamente.");
      };
      reader.onerror = () => {
        setMessage("Error al leer el archivo.");
      };
    }
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();

    // Validación básica
    if (!formState.nombre || !formState.precio || !formState.cantidad) {
      setMessage("Todos los campos son obligatorios.");
      return;
    }

    const dataToSend = {
      nombre: formState.nombre,
      precio: parseFloat(formState.precio),
      cantidad: parseInt(formState.cantidad, 10),
      imagenBase64: formState.imagenBase64,
    };

    const method = mode === "add" ? "POST" : "PUT";
    const endpoint = mode === "add" ? API_URL : `${API_URL}/${formState.id}`;

    const data = await apiCall(endpoint, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    });

    if (data) {
      setMessage(
        `Artículo ${mode === "add" ? "añadido" : "actualizado"} con éxito. 🎉`
      );
      setMode("list");
      fetchArticulos();
      resetForm();
    }
  };

  const handleEditClick = (articulo) => {
    setFormState({
      id: articulo.id,
      nombre: articulo.nombre,
      precio: articulo.precio,
      cantidad: articulo.cantidad,
      imagenBase64: articulo.imagen,
    });
    setMode("edit");
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este artículo?")
    ) {
      const data = await apiCall(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (data) {
        setMessage("Artículo eliminado con éxito. 🗑️");
        fetchArticulos();
      }
    }
  };

  const resetForm = () => {
    setFormState({
      id: null,
      nombre: "",
      precio: "",
      cantidad: "",
      imagenBase64: "",
    });
    setMode("list");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Gestión de Artículos</h1>

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

      {(mode === "add" || mode === "edit") && (
        <div
          style={{
            marginBottom: "20px",
            border: "1px solid #ccc",
            padding: "15px",
          }}
        >
          <h2>
            {mode === "add" ? "Añadir Nuevo Artículo" : "Editar Artículo"}
          </h2>
          <form onSubmit={handleAddOrUpdate}>
            <div style={{ marginBottom: "10px" }}>
              <label>Nombre: </label>
              <input
                type="text"
                name="nombre"
                value={formState.nombre}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Precio: </label>
              <input
                type="number"
                name="precio"
                value={formState.precio}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Cantidad: </label>
              <input
                type="number"
                name="cantidad"
                value={formState.cantidad}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Imagen (máx. 1 MB): </label>
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                disabled={isLoading}
              />
            </div>
            {formState.imagenBase64 && (
              <div style={{ marginBottom: "10px" }}>
                <img
                  src={formState.imagenBase64}
                  alt="Previsualización"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                  }}
                />
              </div>
            )}
            <button type="submit" disabled={isLoading}>
              {mode === "add" ? "Guardar Artículo" : "Actualizar Artículo"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              disabled={isLoading}
              style={{ marginLeft: "10px" }}
            >
              Cancelar
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setMode("add")}
        style={{ marginBottom: "10px" }}
        disabled={mode !== "list" || isLoading}
      >
        Añadir Artículo
      </button>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>ID</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Nombre</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Precio</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              Cantidad
            </th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Imagen</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {articulos.length === 0 && !isLoading ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No hay artículos subidos.
              </td>
            </tr>
          ) : (
            articulos.map((articulo) => (
              <tr key={articulo.id}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {articulo.id}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {articulo.nombre}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {articulo.precio}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {articulo.cantidad}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {articulo.imagen && (
                    <img
                      src={articulo.imagen}
                      alt={articulo.nombre}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  <button
                    onClick={() => handleEditClick(articulo)}
                    disabled={isLoading}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(articulo.id)}
                    disabled={isLoading}
                    style={{ marginLeft: "5px" }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ArticulosPage;
