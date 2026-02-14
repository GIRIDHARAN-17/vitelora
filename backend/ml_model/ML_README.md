# Vitalora Project

This repository contains:
- A FastAPI backend that streams synthetic patient vital signs and predicts a NEWS score using a trained LSTM model.
- A static frontend located in `frontend/` with multiple pages.

## Repository Structure

- `frontend/`
  - `assets/`, `css/`, `js/`, several `.html` pages, and `index.html`
- `ml_model/`
  - `backend/app.py` — FastAPI application
  - `backend/news_lstm_regression.h5` — Trained Keras model (required)
  - `backend/news_scaler.save` — Fitted scaler (required)
  - Other data files and artifacts
  - `requirements.txt` — Python dependencies

## Backend — FastAPI Service

The backend exposes an endpoint that simulates a live stream of vitals and produces a NEWS score prediction once enough time steps are accumulated.

- Framework: FastAPI + Uvicorn
- Model: TensorFlow/Keras LSTM
- Input features order (per step):
  1) respiration_rate (int 10–30)
  2) spo2 (int 88–100)
  3) oxygen_support (int 0–1)
  4) systolic_bp (int 90–160)
  5) heart_rate (int 50–140)
  6) temperature (float 35–40, 1 decimal)
  7) consciousness (int 0–3)
- Sequence length: 30 time steps

### Endpoints

- GET `/auto_stream`
  - Behavior: Each call appends a new random vitals row into an internal buffer.
  - Until the buffer reaches 30 samples: returns `{ "status": "Collecting data...", "current_buffer_size": <n> }`.
  - Once buffer has 30+: scales the sequence and returns:
    ```json
    {
      "latest_vitals": [..7 values..],
      "predicted_news_score": <float>
    }
    ```

Note: There is no route for `/`. A GET to `/` will return 404 by design. Use `/auto_stream`.

## Requirements

Python packages (see `ml_model/requirements.txt`):
- numpy==1.26.4
- pandas==2.2.2
- scikit-learn==1.4.2
- tensorflow==2.15.0
- joblib==1.4.2
- fastapi==0.110.2
- uvicorn[standard]==0.29.0
- matplotlib==3.8.4

## Setup (Windows / cmd or PowerShell)

1) Create and activate a virtual environment (recommended):

- Command Prompt (cmd):
```
python -m venv .venv
.venv\Scripts\activate
```

- PowerShell:
```
python -m venv .venv
. .venv\Scripts\Activate.ps1
```

2) Install dependencies:
```
pip install -r ml_model/requirements.txt
```

3) Run the backend server (from repo root):
```
uvicorn ml_model.backend.app:app --reload
```

Open http://127.0.0.1:8000/auto_stream in your browser or call it via curl.

### Example calls

- Single request:
```
curl http://127.0.0.1:8000/auto_stream
```

- PowerShell loop to accumulate enough samples for a prediction:
```
for ($i=0; $i -lt 35; $i++) { Invoke-RestMethod http://127.0.0.1:8000/auto_stream; Start-Sleep -Milliseconds 500 }
```

- Or manually refresh `/auto_stream` ~30 times in your browser.

## Frontend

The static frontend is under `frontend/`. You can open `frontend/index.html` directly in a browser or serve it locally.

- Open directly:
  - Double-click `frontend/index.html` or drag-drop into a browser.

- Serve with Python http.server (optional):
```
python -m http.server -d frontend 5500
```
Then visit http://127.0.0.1:5500

Note: The frontend is static and not automatically wired to the FastAPI backend in this repo. Connect it to the backend endpoints as needed (e.g., fetch from `/auto_stream`).

## Troubleshooting

- 404 on `/`:
  - Expected. Use `/auto_stream` instead.

- ModuleNotFoundError / missing packages:
  - Ensure the virtual environment is activated and `pip install -r ml_model/requirements.txt` ran successfully.

- TensorFlow installation issues on Windows:
  - Ensure you have a compatible Python version (3.10 or 3.11 typically works for TF 2.15). If issues persist, consider a fresh venv.

- Uvicorn not found:
  - Install dependencies again and confirm the environment is active.

- `code` command not recognized in terminal:
  - Use the full path to VS Code or add it to PATH; this is unrelated to running the backend.

- Model/scaler file not found:
  - Ensure the following files exist:
    - `ml_model/backend/news_lstm_regression.h5`
    - `ml_model/backend/news_scaler.save`

## License

Add your license here (e.g., MIT, Apache-2.0).
