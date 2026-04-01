const { getPrediction, getMetrics } = require('../services/predict.service');
const Prediction = require('../models/prediction.model');

exports.predictTraffic = async (req, res) => {
    try {
        const { time, day, algorithm } = req.body;

        if (!time || !day || !algorithm) {
            return res.status(400).json({ error: "time, day and algorithm are required" });
        }

        // The ML API already handles algorithm="both", so we can just pass it directly
        const result = await getPrediction({ time, day }, algorithm);
        
        // Save to MongoDB via Mongoose
        if (!result.error) {
            await Prediction.create({
                input: { time, day, algorithm },
                prediction: result
            });
        }
        
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

exports.getHistory = async (req, res) => {
    try {
        // Fetch from MongoDB via Mongoose
        const records = await Prediction.find().sort({ timestamp: -1 }).limit(50);
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Prediction.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ error: "Prediction not found" });
        }
        res.json({ message: "Prediction deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
