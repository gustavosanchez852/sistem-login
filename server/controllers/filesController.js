// server/controllers/filesController.js
const fs = require("fs");
const path = require("path");

// Define la ruta al directorio de subidas de forma robusta
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

// Asegúrate de que el directorio de subidas exista
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// POST: Confirmación de subida de archivo
exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se seleccionó ningún archivo." });
  }
  // El archivo ya fue guardado por el middleware de Multer
  res
    .status(200)
    .json({
      message: "Archivo subido con éxito.",
      filename: req.file.filename,
    });
};

// GET: Obtener la lista de archivos
exports.getFiles = (req, res) => {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) {
      console.error("Error al leer el directorio:", err);
      return res.status(500).json({ error: "Error al obtener los archivos." });
    }
    res.status(200).json({ files });
  });
};

// GET: Descargar un archivo
exports.downloadFile = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(UPLOAD_DIR, filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath, filename); // res.download maneja los errores
  } else {
    res.status(404).json({ error: "Archivo no encontrado." });
  }
};

// DELETE: Eliminar un archivo
exports.deleteFile = (req, res) => {
  const { filename } = req.params;
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
};
