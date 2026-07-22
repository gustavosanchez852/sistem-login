// server.js

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3002;
const UPLOAD_DIR = path.join(__dirname, "uploads");

// Configuración de Multer para guardar archivos en la carpeta 'uploads'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

app.use(cors());

// --- Rutas de la API para Archivos ---

// POST: Subir un archivo
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se seleccionó ningún archivo." });
  }
  res
    .status(200)
    .json({
      message: "Archivo subido con éxito.",
      filename: req.file.filename,
    });
});

// GET: Obtener la lista de archivos
app.get("/api/files", (req, res) => {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) {
      console.error("Error al leer el directorio:", err);
      return res.status(500).json({ error: "Error al obtener los archivos." });
    }
    res.status(200).json({ files });
  });
});

// GET: Descargar un archivo
app.get("/api/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(UPLOAD_DIR, filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Error al descargar el archivo:", err);
      }
    });
  } else {
    res.status(404).json({ error: "Archivo no encontrado." });
  }
});

// DELETE: Eliminar un archivo
app.delete("/api/files/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(UPLOAD_DIR, filename);

  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error al eliminar el archivo:", err);
        return res.status(500).json({ error: "Error al eliminar el archivo." });
      }
      res.status(200).json({ message: "Archivo eliminado con éxito." });
    });
  } else {
    res.status(404).json({ error: "Archivo no encontrado." });
  }
});

// Agrega esta nueva ruta en tu server.js
// POST: Procesar un pago
app.post("/api/pagos", async (req, res) => {
  const { cliente, articuloId, cantidad, total } = req.body;
  let client; // Para la transacción

  try {
    client = await pool.connect();
    await client.query("BEGIN"); // Iniciar la transacción

    // 1. Obtener la información del artículo para verificar el stock
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

    // 2. Actualizar la cantidad de artículos (inventario)
    const nuevaCantidad = articulo.cantidad - cantidad;
    await client.query("UPDATE articulos SET cantidad = $1 WHERE id = $2", [
      nuevaCantidad,
      articuloId,
    ]);

    // 3. Registrar el pago en la tabla 'pagos'
    await client.query(
      "INSERT INTO pagos (cliente, articulo_id, nombre_articulo, precio_unitario, cantidad_comprada, total_pagado) VALUES ($1, $2, $3, $4, $5, $6)",
      [cliente, articuloId, articulo.nombre, articulo.precio, cantidad, total]
    );

    await client.query("COMMIT"); // Finalizar la transacción
    res.status(201).json({ message: "Pago procesado y stock actualizado." });
  } catch (err) {
    if (client) {
      await client.query("ROLLBACK"); // Deshacer en caso de error
    }
    console.error("Error en la transacción de pago:", err);
    res.status(500).json({ error: "Error al procesar el pago." });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor de archivos escuchando en http://localhost:${PORT}`);
});
