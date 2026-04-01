const axios = require("axios");

const BASE_URL = process.env.ML_API_URL || "http://127.0.0.1:5000";

async function getPrediction(data, algorithm) {
    try {
        const response = await axios.post(`${BASE_URL}/predict`, {
            input: data,
            algorithm: algorithm
        });
        return response.data;
    } catch (error) {
        console.error("Python API Prediction Error:", error.message);
        const detailedError = error.response ? JSON.stringify(error.response.data) : error.message;
        return { error: `Python API failed to get prediction. Attempted URL: ${BASE_URL}/predict. Details: ${detailedError}` };
    }
}

async function getMetrics() {
    try {
        const response = await axios.get(`${BASE_URL}/metrics`);
        return response.data;
    } catch (error) {
        console.error("Python API Metrics Error:", error.message);
        const detailedError = error.response ? JSON.stringify(error.response.data) : error.message;
        return { error: `Python API failed to get metrics. Attempted URL: ${BASE_URL}/metrics. Details: ${detailedError}` };
    }
}

module.exports = { getPrediction, getMetrics };