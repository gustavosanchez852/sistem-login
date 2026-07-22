// server/routes/articulosRoutes.js

const express = require("express");
const router = express.Router();
const {
  getArticulos,
  createArticulo,
  updateArticulo,
  deleteArticulo,
} = require("../controllers/articulosController");

// Define las rutas y las asocia a las funciones del controlador
router.get("/", getArticulos);
router.post("/", createArticulo);
router.put("/:id", updateArticulo);
router.delete("/:id", deleteArticulo);

module.exports = router;
