// server/controllers/articulosController.js

const pool = require("../db"); // Importamos el pool de conexión que ya tienes configurado

// GET: Obtener todos los artículos
exports.getArticulos = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM articulos ORDER BY id ASC");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener los artículos" });
  }
};

// POST: Añadir un nuevo artículo
exports.createArticulo = async (req, res) => {
  const { nombre, precio, cantidad, imagenBase64 } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO articulos (nombre, precio, cantidad, imagen) VALUES ($1, $2, $3, $4) RETURNING *",
      [nombre, precio, cantidad, imagenBase64]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al añadir el artículo" });
  }
};

// PUT: Actualizar un artículo existente
exports.updateArticulo = async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, cantidad, imagenBase64 } = req.body;
  try {
    const result = await pool.query(
      "UPDATE articulos SET nombre = $1, precio = $2, cantidad = $3, imagen = $4 WHERE id = $5 RETURNING *",
      [nombre, precio, cantidad, imagenBase64, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar el artículo" });
  }
};

// DELETE: Eliminar un artículo
exports.deleteArticulo = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM articulos WHERE id = $1", [
      id,
    ]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }
    res.status(204).end(); // 204 No Content
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar el artículo" });
  }
};
