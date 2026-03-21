import json
import pandas as pd
import joblib
from sklearn.preprocessing import LabelEncoder
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

# Load dataset
df = pd.read_csv("dataset.csv")

# Parse time: extract hour (0-23) and minute from "H:MM:SS AM/PM" format
df["parsed_time"] = pd.to_datetime(df["Time"], format="%I:%M:%S %p", errors="coerce")
df["hour"]   = df["parsed_time"].dt.hour
df["minute"] = df["parsed_time"].dt.minute

# Encode day name and traffic label to numbers
le_day     = LabelEncoder()
le_traffic = LabelEncoder()
df["day"]     = le_day.fit_transform(df["Day of the week"])
df["traffic"] = le_traffic.fit_transform(df["Traffic Situation"])

# Features and target
X = df[["hour", "minute", "day"]]
y = df["traffic"]

# Split for evaluation
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Evaluate on test split
knn_eval = KNeighborsClassifier()
rf_eval  = RandomForestClassifier(random_state=42)
knn_eval.fit(X_train, y_train)
rf_eval.fit(X_train, y_train)
knn_preds = knn_eval.predict(X_test)
rf_preds  = rf_eval.predict(X_test)

classes = list(le_traffic.classes_)

# 10-fold cross-validation scores (used as historical accuracy trend)
knn_cv = [round(s, 4) for s in cross_val_score(KNeighborsClassifier(), X, y, cv=10)]
rf_cv  = [round(s, 4) for s in cross_val_score(RandomForestClassifier(random_state=42), X, y, cv=10)]

# Train final models on full data
knn = KNeighborsClassifier()
rf  = RandomForestClassifier(random_state=42)
knn.fit(X, y)
rf.fit(X, y)

# Save metrics to JSON for the frontend
metrics = {
    "classes": classes,
    "knn": {
        "accuracy":         round(accuracy_score(y_test, knn_preds), 4),
        "confusion_matrix": confusion_matrix(y_test, knn_preds).tolist(),
        "report":           classification_report(y_test, knn_preds, target_names=classes, output_dict=True),
        "cv_scores":        knn_cv
    },
    "rf": {
        "accuracy":           round(accuracy_score(y_test, rf_preds), 4),
        "confusion_matrix":   confusion_matrix(y_test, rf_preds).tolist(),
        "report":             classification_report(y_test, rf_preds, target_names=classes, output_dict=True),
        "cv_scores":          rf_cv,
        "feature_importance": dict(zip(["hour", "minute", "day"], [round(v, 4) for v in rf.feature_importances_]))
    }
}

with open("metrics.json", "w") as f:
    json.dump(metrics, f, indent=2)

# Save models and encoders
joblib.dump(knn,        "knn_model.pkl")
joblib.dump(rf,         "rf_model.pkl")
joblib.dump(le_day,     "le_day.pkl")
joblib.dump(le_traffic, "le_traffic.pkl")

print("Done! Models saved.")
print(f"KNN Accuracy: {metrics['knn']['accuracy']} | RF Accuracy: {metrics['rf']['accuracy']}")
print(f"Classes: {classes}")