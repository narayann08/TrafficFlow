const express = require('express');
const router = express.Router();
const { predictTraffic, getModelMetrics } = require("../controller/predict.controller");

router.post("/predict", predictTraffic);
router.get("/metrics", getModelMetrics);

module.exports = router;
