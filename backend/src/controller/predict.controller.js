const { getPrediction, getMetrics } = require('../services/predict.service');

exports.predictTraffic = async (req, res) => {
    try {
        const { time, day, algorithm } = req.body;

        if (!time || !day || !algorithm) {
            return res.status(400).json({ error: "time, day and algorithm are required" });
        }

        // The ML API already handles algorithm="both", so we can just pass it directly
        const result = await getPrediction({ time, day }, algorithm);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getModelMetrics = async (req, res) => {
    try {
        const result = await getMetrics();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getWakeupUrl = (req, res) => {
    res.json({ ml_api_url: process.env.ML_API_URL || "http://127.0.0.1:5000" });
};
