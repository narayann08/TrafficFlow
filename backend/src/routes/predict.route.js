const express = require('express');
const router = express.Router();
const { predictTraffic, getModelMetrics, getWakeupUrl, getHistory, deleteHistory } = require("../controller/predict.controller");

router.post("/predict", predictTraffic);
router.get("/metrics", getModelMetrics);
router.get("/wakeup", getWakeupUrl);
router.get("/history", getHistory);
router.delete("/history/:id", deleteHistory);

module.exports = router;
