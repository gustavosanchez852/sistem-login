// server/routes/filesRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  uploadFile,
  getFiles,
  downloadFile,
  deleteFile,
} = require("../controllers/filesController");

const router = express.Router();

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // La carpeta 'uploads' se crea en el controlador si no existe
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    // Usar la fecha para evitar sobreescribir archivos con el mismo nombre
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Definición de Rutas
router.post("/upload", upload.single("file"), uploadFile); // Multer actúa como middleware aquí
router.get("/", getFiles);
router.get("/download/:filename", downloadFile);
router.delete("/:filename", deleteFile);

module.exports = router;
