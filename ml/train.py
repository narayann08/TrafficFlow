import json
import pandas as pd
import joblib
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV, RandomizedSearchCV
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

# Add new feature: Is Weekend? (increases accuracy significantly)
# Typically, Saturday and Sunday map to certain index depending on your data sorting so we'll just check if the raw day startswith 'S'
df["is_weekend"] = df["Day of the week"].apply(lambda x: 1 if "Saturday" in x or "Sunday" in x else 0)

# Features and target
X = df[["hour", "minute", "day", "is_weekend"]]
y = df["traffic"]

# ---------------------------------------------------------
# STEP 1.5: SCALE DATA (CRITICAL FOR KNN ACCURACY)
# ---------------------------------------------------------
# KNN measures "distance" between points. Since 'minute' goes up to 59 and 'day' only goes to 6, 
# 'minute' unfairly dominates the algorithm. StandardScaler fixes this.
scaler = StandardScaler()
X_scaled = pd.DataFrame(scaler.fit_transform(X), columns=X.columns)

# Split for evaluation
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# ---------------------------------------------------------
# STEP 2: HYPERPARAMETER TUNING (Finding the best settings)
# ---------------------------------------------------------

# 2A. GridSearchCV for KNN
# GridSearchCV tries EVERY combination in the parameter grid.
print("\n--- Tuning KNN with GridSearchCV ---")
knn_param_grid = {
    'n_neighbors': [3, 5, 7, 9, 11], # Try different numbers of neighbors
    'weights': ['uniform', 'distance'], # Should closer neighbors count more?
    'metric': ['euclidean', 'manhattan'] # How to measure distance
}

# cv=5 means 5-fold cross validation. It splits the training data 5 ways to test it.
knn_search = GridSearchCV(
    KNeighborsClassifier(), 
    knn_param_grid, 
    cv=5, 
    scoring='accuracy', 
    n_jobs=-1 # Use all computer processors to speed it up
)
knn_search.fit(X_train, y_train)

best_knn = knn_search.best_estimator_
print(f"✓ Best KNN params found: {knn_search.best_params_}")


# 2B. RandomizedSearchCV for Random Forest
# RandomForest has too many combinations, so we use "RandomizedSearch" 
# to randomly try a set number of them (n_iter=15), saving huge amounts of time.
print("\n--- Tuning Random Forest with RandomizedSearchCV ---")
rf_param_grid = {
    'n_estimators': [50, 100, 150],       # Number of trees in the forest
    'max_depth': [10, 20, None],          # Maximum depth/levels of the tree
    'min_samples_split': [2, 5],          # Minimum samples required to split a node
    'min_samples_leaf': [1, 2]            # Minimum samples required at each leaf
}

rf_search = RandomizedSearchCV(
    RandomForestClassifier(random_state=42), 
    rf_param_grid, 
    n_iter=15, # Randomly pick 15 combinations from the grid
    cv=5, 
    scoring='accuracy', 
    n_jobs=-1, 
    random_state=42
)
rf_search.fit(X_train, y_train)

best_rf = rf_search.best_estimator_
print(f"✓ Best RF params found: {rf_search.best_params_}\n")

# ---------------------------------------------------------
# STEP 3: EVALUATION & SAVING
# ---------------------------------------------------------

# Evaluate on test split using the best found models
knn_preds = best_knn.predict(X_test)
rf_preds  = best_rf.predict(X_test)

classes = list(le_traffic.classes_)

# 10-fold cross-validation scores for historical accuracy trend using best estimators
knn_cv = [round(s, 4) for s in cross_val_score(best_knn, X_scaled, y, cv=10, n_jobs=-1)]
rf_cv  = [round(s, 4) for s in cross_val_score(best_rf, X_scaled, y, cv=10, n_jobs=-1)]

# Train final models on full data using the optimized best estimators
knn = best_knn
rf  = best_rf
knn.fit(X_scaled, y)
rf.fit(X_scaled, y)

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
        "feature_importance": dict(zip(["hour", "minute", "day", "is_weekend"], [round(v, 4) for v in rf.feature_importances_]))
    }
}

with open("metrics.json", "w") as f:
    json.dump(metrics, f, indent=2)

# Save models and encoders
joblib.dump(knn,        "knn_model.pkl")
joblib.dump(rf,         "rf_model.pkl")
joblib.dump(le_day,     "le_day.pkl")
joblib.dump(le_traffic, "le_traffic.pkl")
joblib.dump(scaler,     "scaler.pkl") # Save the scaler too

print("Done! Models saved.")
print(f"KNN Accuracy: {metrics['knn']['accuracy']} | RF Accuracy: {metrics['rf']['accuracy']}")
print(f"Classes: {classes}")