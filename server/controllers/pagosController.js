// server/controllers/pagosController.js
const pool = require("../db");

// POST: Procesar un pago
exports.processPago = async (req, res) => {
  const { cliente, articuloId, cantidad, total } = req.body;
  let client; // Para la transacción

  try {
    client = await pool.connect();
    await client.query("BEGIN"); // Iniciar la transacción

    const articuloResult = await client.query(
      "SELECT nombre, precio, cantidad FROM articulos WHERE id = $1 FOR UPDATE",
      [articuloId]
    );

    if (articuloResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Artículo no encontrado." });
    }

    const articulo = articuloResult.rows[0];
    if (articulo.cantidad < cantidad) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "No hay suficiente stock." });
    }

    const nuevaCantidad = articulo.cantidad - cantidad;
    await client.query("UPDATE articulos SET cantidad = $1 WHERE id = $2", [
      nuevaCantidad,
      articuloId,
    ]);

    await client.query(
      "INSERT INTO pagos (cliente, articulo_id, nombre_articulo, precio_unitario, cantidad_comprada, total_pagado) VALUES ($1, $2, $3, $4, $5, $6)",
      [cliente, articuloId, articulo.nombre, articulo.precio, cantidad, total]
    );

    await client.query("COMMIT"); // Finalizar la transacción
    res.status(201).json({ message: "Pago procesado y stock actualizado." });
  } catch (err) {
    if (client) await client.query("ROLLBACK");
    console.error("Error en la transacción de pago:", err);
    res.status(500).json({ error: "Error al procesar el pago." });
  } finally {
    if (client) client.release();
  }
};
