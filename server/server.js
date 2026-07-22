// server/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const articulosRoutes = require("./routes/articulosRoutes"); // <-- 1. IMPORTA LAS NUEVAS RUTAS
const filesRoutes = require("./routes/filesRoutes"); // <-- 1. IMPORTA RUTAS DE ARCHIVOS
const pagosRoutes = require("./routes/pagosRoutes"); // <-- 2. IMPORTA RUTAS DE PAGOS

const app = express();

// Middlewares
app.use(cors()); // Permite que el frontend se comunique con el backend
//app.use(express.json()); // Permite al servidor entender JSON
//app.use(express.json({ limit: '1mb' })); // Aumentamos el límite por si las imágenes son grandes
app.use(express.json({ limit: "2mb" }));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/articulos", articulosRoutes); // <-- 2. USA LAS NUEVAS RUTAS
app.use("/api/files", filesRoutes); // <-- 3. USA RUTAS DE ARCHIVOS
app.use("/api/pagos", pagosRoutes); // <-- 4. USA RUTAS DE PAGOS

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
