
# SET Game Detector

An elegant application that detects valid SET combinations from images of the SET card game using computer vision and machine learning.

## Features

- Upload images of SET game layouts
- AI-powered card detection and attribute classification
- Visualization of all valid SET combinations
- iOS-inspired design with SET game-themed styling
- Mobile-friendly responsive interface

## Technologies Used

- **Frontend**: React, Tailwind CSS, Lucide icons
- **Backend**: Python (for model serving)
- **ML/CV**: TensorFlow, PyTorch, OpenCV, YOLO

## Project Structure

```
set-game-detector/
├── public/               # Static files
├── src/
│   ├── components/       # Reusable UI components
│   ├── context/          # React context providers
│   ├── core/             # SET detection logic
│   │   └── setDetector.js # Frontend wrapper for SET detection
│   ├── lib/              # Utility functions
│   ├── pages/            # Main application pages
│   └── ...
├── python/               # Python backend reference implementation
│   └── app.py            # SET detection server
└── models/               # ML models (added during deployment)
    ├── Characteristics/
    │   └── 11022025/     # Shape and fill models
    ├── Shape/
    │   └── 15052024/     # Shape detection models
    └── Card/
        └── 16042024/     # Card detection models
```

## Deployment Options

This application can be deployed in several ways depending on your needs:

### Option 1: Frontend-Only (Demo Mode)

The simplest deployment option uses mock data to simulate SET detection:

1. Build the React app:
   ```
   npm run build
   ```
2. Deploy the contents of the `dist` folder to any static hosting service:
   - Vercel
   - Netlify
   - GitHub Pages
   - Any web hosting service

In this mode, the app will show a working UI but won't perform actual SET detection.

### Option 2: Full-Stack Solution (Recommended for Production)

For a complete working solution with real SET detection:

#### Method A: Separate Frontend & Backend Deployment

1. **Deploy the React Frontend:**
   - Build and deploy as described in Option 1

2. **Deploy the Python Backend:**
   - Use a Python-compatible hosting service:
     - Heroku
     - PythonAnywhere
     - Google Cloud Run
     - AWS Lambda + API Gateway
   - Install dependencies:
     ```
     pip install tensorflow torch ultralytics opencv-python fastapi uvicorn
     ```
   - Upload your ML models to the server
   - Deploy the Python backend (see python/app.py for reference)

3. **Connect Frontend to Backend:**
   - Update `src/core/setDetector.js` to call your backend API

#### Method B: Single-Server Deployment

Deploy both frontend and backend on a single server:

1. Set up a server with both Node.js and Python:
   - AWS EC2
   - DigitalOcean Droplet
   - Any VPS provider

2. Configure the server:
   - Use Nginx to serve the React frontend files
   - Run the Python backend as a service using Gunicorn or Uvicorn
   - Set up proper routing in Nginx to forward API requests to the Python service

#### Method C: Containerized Deployment (Advanced)

Package everything in Docker containers:

1. Create Dockerfiles for both frontend and backend
2. Use Docker Compose to run both services together
3. Deploy to a container orchestration platform:
   - Kubernetes
   - AWS ECS
   - Google Cloud Run
   - Azure Container Apps

## Setting Up the ML Models

The SET detection algorithms require specific machine learning models:

1. Create a `models` directory in your Python backend with this structure:
   ```
   models/
   ├── Characteristics/
   │   └── 11022025/
   │       └── shape_model.keras
   │       └── fill_model.keras
   ├── Shape/
   │   └── 15052024/
   │       └── best.pt
   └── Card/
       └── 16042024/
           └── best.pt
   ```

2. Place your trained models in these locations, or use publicly available models

## Development

To start the development server:

```
npm run dev
```

## License

MIT
