import React, { useState, useEffect } from "react";

const API_ARTICULOS = `${process.env.REACT_APP_API_URL}/api/articulos`;
const API_PAGOS = `${process.env.REACT_APP_API_URL}/api/pagos`;

const PagosPage = () => {
  const [articulos, setArticulos] = useState([]);
  const [selectedArticulo, setSelectedArticulo] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [cliente, setCliente] = useState("");
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
        const errorData = response.headers
          .get("content-type")
          ?.includes("application/json")
          ? await response.json()
          : { message: `Error ${response.status}: ${response.statusText}` };
        throw new Error(errorData.message || "Error en la petición.");
      }
      if (response.status === 204) {
        return { success: true };
      }
      return await response.json();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      console.error(`Error en la petición:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchArticulos = async () => {
    const data = await apiCall(API_ARTICULOS);
    if (data) {
      setArticulos(data);
      if (data.length > 0) {
        setSelectedArticulo(data[0]);
      } else {
        setSelectedArticulo(null);
      }
    }
  };

  const handleArticuloChange = (e) => {
    const articuloId = parseInt(e.target.value);
    const articulo = articulos.find((a) => a.id === articuloId);
    setSelectedArticulo(articulo);
    setCantidad(1);
  };

  const handlePagar = async () => {
    // Validación de campos
    if (!selectedArticulo || !cantidad || !cliente) {
      setMessage("Por favor, completa todos los campos.");
      return;
    }

    // Validación de stock
    if (cantidad > selectedArticulo.cantidad) {
      setMessage(
        `No hay suficiente stock. Cantidad disponible: ${selectedArticulo.cantidad}`
      );
      return;
    }

    const pagoData = {
      articuloId: selectedArticulo.id,
      cantidad,
      cliente,
      total: selectedArticulo.precio * cantidad,
    };

    const data = await apiCall(API_PAGOS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pagoData),
    });

    if (data) {
      setMessage(
        `Pago de ${pagoData.total.toFixed(
          2
        )}€ realizado con éxito. ¡Gracias, ${cliente}! 🎉`
      );
      fetchArticulos();
      setCliente("");
      setCantidad(1);
    }
  };

  const handleCantidadChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setCantidad(value);
    } else {
      setCantidad(""); // Limpia el campo si el valor no es válido
    }
  };

  const totalAPagar =
    selectedArticulo && !isNaN(cantidad)
      ? (selectedArticulo.precio * cantidad).toFixed(2)
      : "0.00";

  return (
    <div style={{ padding: "20px" }}>
      <h1>Procesar Pagos</h1>

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

      <div style={{ marginBottom: "20px" }}>
        <label>
          Cliente:
          <input
            type="text"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            style={{ marginLeft: "10px" }}
            disabled={isLoading}
            required
          />
        </label>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label>
          Artículo:
          <select
            onChange={handleArticuloChange}
            value={selectedArticulo ? selectedArticulo.id : ""}
            style={{ marginLeft: "10px" }}
            disabled={isLoading}
          >
            {articulos.length === 0 ? (
              <option value="">No hay artículos disponibles</option>
            ) : (
              articulos.map((articulo) => (
                <option key={articulo.id} value={articulo.id}>
                  {articulo.nombre} - {articulo.precio}€ ({articulo.cantidad} en
                  stock)
                </option>
              ))
            )}
          </select>
        </label>
      </div>

      {selectedArticulo && (
        <div style={{ marginBottom: "20px" }}>
          <p>Precio unitario: {selectedArticulo.precio}€</p>
          <label>
            Cantidad a comprar:
            <input
              type="number"
              min="1"
              max={selectedArticulo.cantidad}
              value={cantidad}
              onChange={handleCantidadChange}
              style={{ marginLeft: "10px" }}
              disabled={isLoading}
            />
          </label>
        </div>
      )}

      <h3>Total a Pagar: {totalAPagar}€</h3>

      <button
        onClick={handlePagar}
        style={{ padding: "10px 20px", fontSize: "16px" }}
        disabled={
          isLoading ||
          !selectedArticulo ||
          !cliente ||
          !cantidad ||
          cantidad > selectedArticulo.cantidad
        }
      >
        {isLoading ? "Procesando..." : "Pagar"}
      </button>
    </div>
  );
};

export default PagosPage;
