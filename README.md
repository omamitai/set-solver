
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
- **Backend**: Python, Gradio
- **ML/CV**: TensorFlow, PyTorch, OpenCV, YOLO

## Deployment

### Gradio Deployment

1. Clone this repository
2. Install the required Python packages:
   ```
   pip install gradio numpy opencv-python pandas tensorflow torch ultralytics pillow
   ```
3. Run the Gradio app:
   ```
   python app.py
   ```

### Setting up the models

For production deployment, you'll need to prepare the following:

1. Create the necessary directories:
   ```
   mkdir -p models/Characteristics/11022025
   mkdir -p models/Shape/15052024
   mkdir -p models/Card/16042024
   ```

2. Place your trained models in these directories:
   - `models/Characteristics/11022025/shape_model.keras` - For shape classification
   - `models/Characteristics/11022025/fill_model.keras` - For fill pattern classification
   - `models/Shape/15052024/best.pt` - YOLO model for shape detection
   - `models/Card/16042024/best.pt` - YOLO model for card detection

## Development

To work on the frontend React application:

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
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
