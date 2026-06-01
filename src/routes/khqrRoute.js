const express = require("express");
const router = express.Router();

const { createKHQR } = require("../controller/khqrController");

router.post("/api/khqr", createKHQR);

module.exports = router;