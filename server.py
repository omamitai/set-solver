
"""
SET Game Detector Server

This is the main backend server for the SET Game Detector application.
It provides an API endpoint for processing images of SET card games
and detecting valid SET combinations.

Usage:
  - Run directly: python server.py
  - With gunicorn: gunicorn --workers 2 --timeout 120 --bind 0.0.0.0:8000 server:app

Environment settings:
  - PORT: The port to run the server on (default: 8000)
  - USE_MOCK_DATA: Set to 'true' for development without models
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import numpy as np
import cv2
import base64
import time
from io import BytesIO
from PIL import Image
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('set-detector')

app = Flask(__name__, static_folder='build')
CORS(app)

# Environment configuration
USE_MOCK_DATA = os.environ.get('USE_MOCK_DATA', 'false').lower() == 'true'
PORT = int(os.environ.get('PORT', 8000))

# Mock implementation for development without models
def mock_detect_sets(image_data):
    """
    Generate mock SET detection results for development/testing
    
    Args:
        image_data: The image data from the request
        
    Returns:
        A dictionary containing mock results
    """
    logger.info("Using mock SET detection")
    
    # Simulate processing time
    time.sleep(1.5)
    
    # Parse the input image
    if isinstance(image_data, bytes):
        img = np.array(Image.open(BytesIO(image_data)))
    else:
        img = np.array(image_data)
    
    # Convert to OpenCV format if needed
    if len(img.shape) == 3 and img.shape[2] == 3:
        img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
    
    # Simulate finding a random number of sets (1-5)
    num_sets = np.random.randint(1, 6)
    
    # Create a simple visualization (boxes in different colors)
    h, w = img.shape[:2]
    colors = [(0, 0, 255), (0, 255, 0), (255, 0, 255), (0, 255, 255), (255, 255, 0)]
    
    # Draw some random boxes to simulate detected sets
    result_img = img.copy()
    for i in range(num_sets):
        color = colors[i % len(colors)]
        # Random positions for 3 cards (a SET has 3 cards)
        for _ in range(3):
            x1 = np.random.randint(0, w - w//4)
            y1 = np.random.randint(0, h - h//4)
            x2 = x1 + np.random.randint(w//8, w//4)
            y2 = y1 + np.random.randint(h//8, h//4)
            cv2.rectangle(result_img, (x1, y1), (x2, y2), color, 3)
    
    # Convert the annotated image to base64 for sending to frontend
    result_img = cv2.cvtColor(result_img, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(result_img)
    buffered = BytesIO()
    pil_img.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return {
        "success": True,
        "setCount": num_sets,
        "image": f"data:image/jpeg;base64,{img_str}"
    }

# Production implementation
def real_detect_sets(image_data):
    """
    Detect SET combinations in the provided image using ML models
    
    In a production environment, this would load trained models and
    process the image to find valid SETs.
    
    Args:
        image_data: The image data from the request
        
    Returns:
        A dictionary containing detection results
    """
    logger.info("Using real SET detection")
    
    # In a real implementation, you would:
    # 1. Load your ML models
    # 2. Preprocess the image
    # 3. Detect cards
    # 4. Identify valid SETs
    # 5. Return results
    
    # For this simplified version, we'll use the mock implementation
    # In production, replace this with actual model loading and inference
    return mock_detect_sets(image_data)

@app.route('/api/detect-sets', methods=['POST'])
def detect_sets():
    """API endpoint to detect SETs in an uploaded image"""
    try:
        if 'file' not in request.files:
            return jsonify({"success": False, "error": "No file part"}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({"success": False, "error": "No file selected"}), 400
            
        # Get the image data
        image_data = file.read()
        
        # Choose implementation based on configuration
        if USE_MOCK_DATA:
            result = mock_detect_sets(image_data)
        else:
            result = real_detect_sets(image_data)
            
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}", exc_info=True)
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint for monitoring"""
    return jsonify({"status": "ok"})

# For production deployments, serve the frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    """Serve the frontend files"""
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    logger.info(f"Starting SET Game Detector server on port {PORT}")
    logger.info(f"Mock mode: {USE_MOCK_DATA}")
    app.run(host='0.0.0.0', port=PORT, debug=False)
