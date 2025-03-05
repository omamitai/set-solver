
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
│   ├── lib/              # Utility functions
│   ├── pages/            # Main application pages
│   └── ...
├── models/               # ML models (added during deployment)
│   ├── Characteristics/
│   │   └── 11022025/     # Shape and fill models
│   ├── Shape/
│   │   └── 15052024/     # Shape detection models
│   └── Card/
│       └── 16042024/     # Card detection models
└── python/               # Python backend (for production)
    └── app.py            # SET detection server
```

## Deployment

### Standard Web Deployment

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Build the project:
   ```
   npm run build
   ```
4. Deploy the contents of the `dist` folder to your web hosting service

### Backend Setup for SET Detection

For the actual SET detection functionality, you'll need to deploy a Python backend:

1. Place the Python backend code in a separate repository or service
2. Set up an API endpoint that accepts image uploads and runs the SET detection
3. Update the `src/core/setDetector.js` file to make actual API calls to your backend

#### Model Setup

Place your trained models in these directories:
- `models/Characteristics/11022025/shape_model.keras` - For shape classification
- `models/Characteristics/11022025/fill_model.keras` - For fill pattern classification
- `models/Shape/15052024/best.pt` - YOLO model for shape detection
- `models/Card/16042024/best.pt` - YOLO model for card detection

## Development

To start the development server:

```
npm run dev
```

## Design Principles

- **iOS-inspired**: Clean, minimal interface with frosted glass effects and subtle shadows
- **SET-themed**: Color palette based on the classic SET game colors (purple, red, green)
- **Responsive**: Fully functional across all device sizes
- **Accessible**: High contrast elements and readable text

## License

MIT
