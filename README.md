# TrafficFlow - ML-Powered Traffic Prediction System

TrafficFlow is a modern, full-stack web application designed to locally predict real-time traffic levels (Heavy, High, Normal, Low) utilizing Machine Learning algorithms. The system relies on a seamless pipeline integrating a Next.js Frontend dashboard, an Express Node.js Backend router, and a Python Scikit-Learn prediction engine running on a Flask API.

## Project Architecture

1. **Frontend (`/frontend`)**: Next.js UI Application (Runs on port `3001`)
2. **Backend (`/backend`)**: Node.js/Express Router (Runs on port `3000`)
3. **ML Engine (`/ml`)**: Python/Flask API utilizing Random Forest & KNN algorithms (Runs on port `5000`)

---

## Getting Started

To run the full stack locally, you need to open three separate terminal windows and run these servers simultaneously. Follow the setup directions below.

### 1. Launch the Python ML Prediction Engine
Navigate to the `ml` folder, install the required python packages, and start the Flask server on port `5000`.

```bash
cd ml

# (Optional) Setup a virtual environment
# python -m venv venv
# venv\Scripts\activate      # Windows
# source venv/bin/activate   # Mac/Linux

# Install necessary python dependencies
pip install pandas scikit-learn flask flask-cors joblib

# Start the ML API server
python app.py
```
> **Success check:** You should see `Running on http://127.0.0.1:5000`

### 2. Launch the Node.js Express Backend
Open a **new terminal tab**. Navigate to the `backend` folder, install the NPM packages, and start the API Router. This runs on port `3000`.

```bash
cd backend

# Install all node dependencies
npm install

# Start the Express Server
npm run dev
# Note: If nodemon fails, you can run: node src/server.js
```
> **Success check:** You should see `Server is running on port 3000`

### 3. Launch the Next.js Frontend Dashboard
Open a **third terminal tab**. Navigate to the `frontend` directory, install packages, and boot up the UI on port `3001` (to avoid conflicting with the backend running on 3000).

```bash
cd frontend

# Install UI dependencies
npm install

# Start the Next.js Development Server on port 3001
npx next dev -p 3001
```
> **Success check:** You should see `Ready in ...s` inside the terminal.

### 4. Open the App in your Browser
Once all 3 terminals are actively running, open your browser and navigate to the application interface:  
🔗 **[http://localhost:3001](http://localhost:3001)**

Select a time, day, and ML algorithm in the interface, and hit "Run Prediction" to see the full-stack architecture query the live model! Or select "Compare Both" to graph K-Nearest-Neighbors vs. Random Forest simultaneously.


