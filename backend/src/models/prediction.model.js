const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    input: {
        time: { type: String, required: true },
        day: { type: String, required: true },
        algorithm: { type: String, required: true }
    },
    prediction: { type: mongoose.Schema.Types.Mixed, required: true }
});

module.exports = mongoose.model('Prediction', predictionSchema);