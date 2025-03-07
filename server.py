
"""
SET Game Detector Server

A simplified Flask server for SET detection that works well on EC2.

To run:
    python server.py  # for development
    gunicorn --bind 0.0.0.0:8000 server:app  # for production
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import cv2
import tensorflow as tf
from tensorflow.keras.models import load_model
import torch
from ultralytics import YOLO
from itertools import combinations
from pathlib import Path
import base64
import logging
import sys
import time
import os
import traceback
import pandas as pd

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("set_detector.log")
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Base path for models
MODEL_BASE_DIR = Path("models")

# Model paths
SHAPE_MODEL_PATH = MODEL_BASE_DIR / "Characteristics" / "11022025" / "shape_model.keras"
FILL_MODEL_PATH = MODEL_BASE_DIR / "Characteristics" / "11022025" / "fill_model.keras"
SHAPE_DETECTOR_PATH = MODEL_BASE_DIR / "Shape" / "15052024" / "best.pt"
CARD_DETECTOR_PATH = MODEL_BASE_DIR / "Card" / "16042024" / "best.pt"

# Global variables for models
model_shape = None
model_fill = None
detector_card = None
detector_shape = None

def load_models():
    """Load all required models for SET detection"""
    global model_shape, model_fill, detector_card, detector_shape
    
    try:
        logger.info("Loading models...")
        
        # Check if models directory exists
        if not MODEL_BASE_DIR.exists():
            logger.error(f"Models directory not found: {MODEL_BASE_DIR}")
            raise FileNotFoundError(f"Models directory not found: {MODEL_BASE_DIR}")
        
        # Load classification models
        if SHAPE_MODEL_PATH.exists():
            logger.info("Loading shape model...")
            model_shape = load_model(str(SHAPE_MODEL_PATH))
        else:
            logger.error(f"Shape model not found at {SHAPE_MODEL_PATH}")
            raise FileNotFoundError(f"Shape model not found")
            
        if FILL_MODEL_PATH.exists():
            logger.info("Loading fill model...")
            model_fill = load_model(str(FILL_MODEL_PATH))
        else:
            logger.error(f"Fill model not found at {FILL_MODEL_PATH}")
            raise FileNotFoundError(f"Fill model not found")
        
        # Load detection models
        if SHAPE_DETECTOR_PATH.exists():
            logger.info("Loading shape detector...")
            detector_shape = YOLO(str(SHAPE_DETECTOR_PATH))
            detector_shape.conf = 0.5
        else:
            logger.error(f"Shape detector not found at {SHAPE_DETECTOR_PATH}")
            raise FileNotFoundError(f"Shape detector not found")
            
        if CARD_DETECTOR_PATH.exists():
            logger.info("Loading card detector...")
            detector_card = YOLO(str(CARD_DETECTOR_PATH))
            detector_card.conf = 0.5
        else:
            logger.error(f"Card detector not found at {CARD_DETECTOR_PATH}")
            raise FileNotFoundError(f"Card detector not found")
            
        # Use GPU if available
        if torch.cuda.is_available():
            logger.info("CUDA available, using GPU")
            detector_card.to("cuda")
            detector_shape.to("cuda")
        else:
            logger.info("CUDA not available, using CPU")
            
        logger.info("All models loaded successfully")
        return True
    except Exception as e:
        logger.error(f"Error loading models: {str(e)}")
        logger.error(traceback.format_exc())
        return False

# Core SET detection functions
def correct_orientation(board_image, card_detector):
    """Rotate image if cards are vertical"""
    detection = card_detector(board_image)
    boxes = detection[0].boxes.xyxy.cpu().numpy().astype(int)
    if boxes.size == 0: return board_image, False
    
    widths = boxes[:, 2] - boxes[:, 0]
    heights = boxes[:, 3] - boxes[:, 1]
    
    return (cv2.rotate(board_image, cv2.ROTATE_90_CLOCKWISE), True) if np.mean(heights) > np.mean(widths) else (board_image, False)

def restore_orientation(img, was_rotated):
    """Restore original orientation if needed"""
    return cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE) if was_rotated else img

def predict_color(img_bgr):
    """Classify color using HSV thresholds"""
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    mask_green = cv2.inRange(hsv, np.array([40, 50, 50]), np.array([80, 255, 255]))
    mask_purple = cv2.inRange(hsv, np.array([120, 50, 50]), np.array([160, 255, 255]))
    
    # Red wraps around hue=0
    mask_red1 = cv2.inRange(hsv, np.array([0, 50, 50]), np.array([10, 255, 255]))
    mask_red2 = cv2.inRange(hsv, np.array([170, 50, 50]), np.array([180, 255, 255]))
    mask_red = cv2.bitwise_or(mask_red1, mask_red2)

    counts = {"green": cv2.countNonZero(mask_green), "purple": cv2.countNonZero(mask_purple), 
              "red": cv2.countNonZero(mask_red)}
    return max(counts, key=counts.get)

def detect_cards(board_img, card_detector):
    """Detect card bounding boxes using YOLO"""
    result = card_detector(board_img)
    boxes = result[0].boxes.xyxy.cpu().numpy().astype(int)
    return [(board_img[y1:y2, x1:x2], [x1, y1, x2, y2]) for x1, y1, x2, y2 in boxes]

def predict_card_features(card_img, shape_detector, fill_model, shape_model, card_box):
    """Predict features (count, color, fill, shape) for a card"""
    # Detect shapes on card
    shape_detections = shape_detector(card_img)
    c_h, c_w = card_img.shape[:2]
    card_area = c_w * c_h
    
    # Filter shape detections
    shape_boxes = []
    for coords in shape_detections[0].boxes.xyxy.cpu().numpy():
        x1, y1, x2, y2 = coords.astype(int)
        if (x2 - x1) * (y2 - y1) > 0.03 * card_area:
            shape_boxes.append([x1, y1, x2, y2])
    
    if not shape_boxes:
        return {'count': 0, 'color': 'unknown', 'fill': 'unknown', 'shape': 'unknown', 'box': card_box}
    
    # Process each shape for classification
    fill_input_size = fill_model.input_shape[1:3]
    shape_input_size = shape_model.input_shape[1:3]
    fill_imgs, shape_imgs, color_candidates = [], [], []
    
    for sb in shape_boxes:
        sx1, sy1, sx2, sy2 = sb
        shape_crop = card_img[sy1:sy2, sx1:sx2]
        fill_imgs.append(cv2.resize(shape_crop, fill_input_size) / 255.0)
        shape_imgs.append(cv2.resize(shape_crop, shape_input_size) / 255.0)
        color_candidates.append(predict_color(shape_crop))
    
    # Classify shapes and fills
    fill_preds = fill_model.predict(np.array(fill_imgs), batch_size=len(fill_imgs), verbose=0)
    shape_preds = shape_model.predict(np.array(shape_imgs), batch_size=len(shape_imgs), verbose=0)
    
    fill_labels = ['empty', 'full', 'striped']
    shape_labels = ['diamond', 'oval', 'squiggle']
    
    fill_result = [fill_labels[np.argmax(fp)] for fp in fill_preds]
    shape_result = [shape_labels[np.argmax(sp)] for sp in shape_preds]
    
    return {
        'count': len(shape_boxes),
        'color': max(set(color_candidates), key=color_candidates.count),
        'fill': max(set(fill_result), key=fill_result.count),
        'shape': max(set(shape_result), key=shape_result.count),
        'box': card_box
    }

def classify_cards_on_board(board_img, card_detector, shape_detector, fill_model, shape_model):
    """Detect and classify all cards on the board"""
    card_rows = []
    for card_img, box in detect_cards(board_img, card_detector):
        card_feats = predict_card_features(card_img, shape_detector, fill_model, shape_model, box)
        card_rows.append({
            "Count": card_feats['count'],
            "Color": card_feats['color'],
            "Fill": card_feats['fill'],
            "Shape": card_feats['shape'],
            "Coordinates": card_feats['box']
        })
    return pd.DataFrame(card_rows)

def valid_set(cards):
    """Check if 3 cards form a valid SET"""
    for feature in ["Count", "Color", "Fill", "Shape"]:
        # Each feature must be all same or all different
        if len(set(card[feature] for card in cards)) not in (1, 3):
            return False
    return True

def locate_all_sets(cards_df):
    """Find all possible SETs from the cards"""
    found_sets = []
    for combo in combinations(cards_df.iterrows(), 3):
        cards = [c[1] for c in combo]
        if valid_set(cards):
            found_sets.append({
                'set_indices': [c[0] for c in combo],
                'cards': [{f: card[f] for f in ['Count', 'Color', 'Fill', 'Shape', 'Coordinates']} 
                          for card in cards]
            })
    return found_sets

def draw_set_indicators(img, sets):
    """Draw SET indicators on the image"""
    result = img.copy()
    colors = [(0, 0, 255), (0, 255, 0), (255, 0, 255), (0, 255, 255), (255, 255, 0)]
    
    for idx, set_info in enumerate(sets):
        color = colors[idx % len(colors)]
        for card in set_info['cards']:
            x1, y1, x2, y2 = card['Coordinates']
            cv2.rectangle(result, (x1, y1), (x2, y2), color, 3)
            
    return result

@app.route('/')
def index():
    """Root endpoint to check if server is running"""
    return "SET Game Detector Server is running. Use /api/detect-sets to analyze an image."

@app.route('/health')
def health():
    """Health check endpoint"""
    if model_shape is None or model_fill is None or detector_card is None or detector_shape is None:
        return jsonify({"status": "error", "message": "Models not loaded"}), 500
    return jsonify({"status": "healthy", "message": "Server is running and models are loaded"})

@app.route('/api/detect-sets', methods=['POST'])
def detect_sets():
    """Endpoint to detect SETs in an uploaded image"""
    start_time = time.time()
    
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file part"}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"success": False, "error": "No selected file"}), 400
        
    try:
        # Read image
        file_bytes = file.read()
        nparr = np.frombuffer(file_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return jsonify({"success": False, "error": "Failed to decode image"}), 400
            
        logger.info(f"Processing image of shape {image.shape}")
        
        # Correct orientation
        processed, was_rotated = correct_orientation(image, detector_card)
        
        # Detect cards and find sets
        df_cards = classify_cards_on_board(processed, detector_card, detector_shape, model_fill, model_shape)
        found_sets = locate_all_sets(df_cards)
        
        logger.info(f"Found {len(found_sets)} sets")
        
        # Draw results
        if found_sets:
            annotated = draw_set_indicators(processed.copy(), found_sets)
            final_image = restore_orientation(annotated, was_rotated)
        else:
            final_image = restore_orientation(processed, was_rotated)
        
        # Convert processed image to base64 for sending to frontend
        _, buffer = cv2.imencode('.jpg', final_image)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        processing_time = time.time() - start_time
        logger.info(f"Processing completed in {processing_time:.2f} seconds")
        
        return jsonify({
            "success": True,
            "setCount": len(found_sets),
            "image": f"data:image/jpeg;base64,{img_base64}",
            "sets": found_sets,
            "processingTime": f"{processing_time:.2f}"
        })
    except Exception as e:
        logger.exception("Error processing image")
        return jsonify({
            "success": False, 
            "error": str(e),
            "serverInfo": {
                "pythonVersion": sys.version,
                "torchVersion": torch.__version__,
                "tfVersion": tf.__version__,
                "gpuAvailable": torch.cuda.is_available()
            }
        }), 500

if __name__ == "__main__":
    # Load models before starting the server
    if not load_models():
        logger.critical("Failed to load models, exiting")
        sys.exit(1)
    
    # Get port from environment variable or use default
    port = int(os.environ.get('PORT', 8000))
    
    # Determine if we're in development or production
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f"Starting server on port {port} in {'development' if debug_mode else 'production'} mode")
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
