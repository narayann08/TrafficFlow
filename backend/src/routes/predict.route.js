const express = require('express');
const router = express.Router();
const { predictTraffic, getModelMetrics, getWakeupUrl } = require("../controller/predict.controller");

router.post("/predict", predictTraffic);
router.get("/metrics", getModelMetrics);
router.get("/wakeup", getWakeupUrl);

module.exports = router;
