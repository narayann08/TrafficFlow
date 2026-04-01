from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import json

app = Flask(__name__)
CORS(app)

# Load saved models and encoders
knn        = joblib.load("knn_model.pkl")
rf         = joblib.load("rf_model.pkl")
le_day     = joblib.load("le_day.pkl")
le_traffic = joblib.load("le_traffic.pkl")
scaler     = joblib.load("scaler.pkl")

# Load pre-computed metrics (accuracy, confusion matrix, CV scores, etc.)
with open("metrics.json") as f:
    metrics = json.load(f)

@app.route("/predict", methods=["POST"])
def predict():
    data      = request.json
    algo      = data["algorithm"]
    time_str  = str(data["input"]["time"])   # "HH:MM" in 24H format
    day_label = data["input"]["day"]

    parts  = time_str.split(":") if ":" in time_str else [time_str, "0"]
    hour   = int(parts[0])
    minute = int(parts[1])

    day = le_day.transform([day_label])[0]
    is_weekend = 1 if day_label.lower() in ['saturday', 'sunday'] else 0
    
    import pandas as pd
    # Crucial: Apply the same scaling that was used during training
    X   = pd.DataFrame([[hour, minute, day, is_weekend]], columns=["hour", "minute", "day", "is_weekend"])
    X_scaled = scaler.transform(X)

    def predict_label(model):
        return le_traffic.inverse_transform(model.predict(X_scaled))[0]

    if algo == "knn":
        result = {"traffic_level": predict_label(knn)}
    elif algo == "rf":
        result = {"traffic_level": predict_label(rf)}
    elif algo == "both":
        result = {"knn": predict_label(knn), "rf": predict_label(rf)}
    else:
        return jsonify({"error": "Invalid algorithm"}), 400

    # Removed MongoDB save here, now handled in Node.js backend

    return jsonify(result)

# History endpoint moved to Node.js backend

@app.route("/metrics", methods=["GET"])
def get_metrics():
    return jsonify(metrics)

if __name__ == "__main__":
    app.run(port=5000)
