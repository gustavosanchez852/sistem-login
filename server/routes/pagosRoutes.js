// server/routes/pagosRoutes.js
const express = require("express");
const router = express.Router();
const { processPago } = require("../controllers/pagosController");

router.post("/", processPago);

module.exports = router;
