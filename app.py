
import gradio as gr
import numpy as np
import cv2
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import load_model
import torch
from ultralytics import YOLO
from itertools import combinations
from pathlib import Path
from typing import Tuple, List, Dict
import tempfile
import time
import os
import base64
from PIL import Image
import io

# Model loading with caching
def load_models():
    """Load all required models for SET detection"""
    base_dir = Path("models")
    
    # Create directories if they don't exist 
    # (for demonstration - in production you'd have these ready)
    os.makedirs(base_dir / "Characteristics" / "11022025", exist_ok=True)
    os.makedirs(base_dir / "Shape" / "15052024", exist_ok=True)
    os.makedirs(base_dir / "Card" / "16042024", exist_ok=True)
    
    # In a real deployment, you would have pre-trained models
    # This is just a placeholder implementation that returns dummy models
    
    # Placeholder for classification models (in production, use load_model())
    class DummyKerasModel:
        def __init__(self):
            self.input_shape = (None, 224, 224, 3)
            
        def predict(self, x, batch_size=None, verbose=0):
            batch_size = x.shape[0] if batch_size is None else batch_size
            if 'shape' in self.__dict__.get('model_type', ''):
                # For shape model: diamond, oval, squiggle
                return np.array([[0.7, 0.2, 0.1]] * batch_size)
            else:
                # For fill model: empty, full, striped
                return np.array([[0.3, 0.6, 0.1]] * batch_size)
    
    # Placeholder for YOLO models
    class DummyYOLO:
        def __init__(self):
            self.conf = 0.5
            
        def to(self, device):
            return self
            
        def __call__(self, img):
            # Create dummy detection with boxes
            class DummyBoxes:
                def __init__(self, img_shape):
                    h, w = img_shape[:2]
                    # Create 1-3 random boxes
                    num_boxes = np.random.randint(1, 4)
                    self.xyxy = torch.tensor([
                        [w*0.1, h*0.1, w*0.3, h*0.3], 
                        [w*0.4, h*0.4, w*0.6, h*0.6],
                        [w*0.7, h*0.7, w*0.9, h*0.9]
                    ][:num_boxes]).unsqueeze(0)
                
                def cpu(self):
                    return self
                    
                def numpy(self):
                    return self.xyxy.numpy()
            
            class DummyDetection:
                def __init__(self, img_shape):
                    self.boxes = DummyBoxes(img_shape)
                    
            return [DummyDetection(img.shape)]
    
    # Create dummy models
    model_shape = DummyKerasModel()
    model_shape.model_type = 'shape'
    model_fill = DummyKerasModel()
    model_fill.model_type = 'fill'
    
    detector_shape = DummyYOLO()
    detector_card = DummyYOLO()
    
    # For real deployment, uncomment these lines and remove the dummy models:
    # char_path = base_dir / "Characteristics" / "11022025"
    # shape_path = base_dir / "Shape" / "15052024" 
    # card_path = base_dir / "Card" / "16042024"
    
    # # Load classification models
    # model_shape = load_model(str(char_path / "shape_model.keras"))
    # model_fill = load_model(str(char_path / "fill_model.keras"))
    
    # # Load detection models
    # detector_shape = YOLO(str(shape_path / "best.pt"))
    # detector_shape.conf = 0.5
    # detector_card = YOLO(str(card_path / "best.pt"))
    # detector_card.conf = 0.5
    
    # if torch.cuda.is_available():
    #     detector_card.to("cuda")
    #     detector_shape.to("cuda")
        
    return model_shape, model_fill, detector_card, detector_shape

# Load the SET game detection functions
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

def identify_sets(image):
    """Complete pipeline to find SETs in an image"""
    # Load models
    model_shape, model_fill, detector_card, detector_shape = load_models()
    
    # Correct orientation
    processed, was_rotated = correct_orientation(image, detector_card)
    
    # Detect cards and find sets
    df_cards = classify_cards_on_board(processed, detector_card, detector_shape, model_fill, model_shape)
    found_sets = locate_all_sets(df_cards)
    
    # Draw results
    if found_sets:
        annotated = draw_set_indicators(processed.copy(), found_sets)
        final_image = restore_orientation(annotated, was_rotated)
        return found_sets, final_image
    else:
        return [], restore_orientation(processed, was_rotated)

# Helper functions for Gradio
def process_image(input_img):
    # Convert from PIL to OpenCV format
    img_array = np.array(input_img)
    # Convert RGB to BGR (OpenCV format)
    cv_image = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
    
    # For demo purposes, simulate processing time
    time.sleep(2)
    
    # Process the image to find sets
    found_sets, result_image = identify_sets(cv_image)
    
    # Convert back to RGB for display
    result_rgb = cv2.cvtColor(result_image, cv2.COLOR_BGR2RGB)
    
    # Create a formatted message about the found sets
    if found_sets:
        message = f"Found {len(found_sets)} valid SET(s)!\n\n"
        
        for i, set_info in enumerate(found_sets):
            cards_info = []
            for card in set_info['cards']:
                card_str = f"{card['Count']} {card['Color']} {card['Fill']} {card['Shape']}"
                cards_info.append(card_str)
            
            message += f"SET {i+1}: {' + '.join(cards_info)}\n"
    else:
        message = "No valid SETs found in this image."
    
    return Image.fromarray(result_rgb), message

# Create the Gradio interface with enhanced styling
def create_interface():
    # Custom CSS for SET-themed styling
    css = """
    @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@300;400;500;600;700&display=swap');

    body {
        font-family: 'SF Pro Display', sans-serif;
        background: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(240,240,245,0.9) 100%);
    }
    
    .gradio-container {
        max-width: 1200px !important;
    }
    
    .main-header {
        text-align: center;
        margin-bottom: 2rem;
    }
    
    /* SET game colors */
    .set-purple { color: #8B5CF6; }
    .set-red { color: #EF4444; }
    .set-green { color: #10B981; }
    
    /* iOS-style elements */
    .ios-card {
        border-radius: 16px;
        padding: 1.5rem;
        background-color: rgba(255, 255, 255, 0.85);
        box-shadow: 0 8px 32px -10px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.8);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .ios-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 40px -10px rgba(0, 0, 0, 0.25);
    }
    
    /* Custom file upload area */
    .upload-btn {
        background-color: rgba(139, 92, 246, 0.15);
        color: #8B5CF6;
        border: 1px solid rgba(139, 92, 246, 0.3);
        border-radius: 50px;
        padding: 0.75rem 2rem;
        font-weight: 500;
        transition: all 0.3s ease;
    }
    
    .upload-btn:hover {
        background-color: rgba(139, 92, 246, 0.25);
        transform: translateY(-2px);
    }
    
    /* Section styling */
    .section-title {
        text-align: center;
        margin: 2rem 0 1rem;
        font-weight: 600;
        font-size: 1.5rem;
    }
    
    /* Enhanced output area */
    .result-area {
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 8px 32px -10px rgba(0, 0, 0, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.8);
    }
    
    /* Footer */
    .footer {
        text-align: center;
        margin-top: 3rem;
        opacity: 0.7;
        font-size: 0.85rem;
        padding: 1rem 0;
    }
    """
    
    # Header HTML
    header_html = """
    <div class="main-header">
        <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 10px;">
            <span class="set-purple">◆</span>
            <span class="set-red">●</span>
            <span class="set-green">▲</span>
        </div>
        <h1>SET Game Detector</h1>
        <p style="color: #6B7280; max-width: 600px; margin: 10px auto;">
            Upload an image of your SET card game layout and our AI will identify all valid sets for you
        </p>
    </div>
    """
    
    # Steps HTML
    steps_html = """
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0;">
        <div class="ios-card">
            <div style="color: #8B5CF6; font-size: 2rem; margin-bottom: 10px;">◆</div>
            <h3>Upload Image</h3>
            <p style="color: #6B7280; font-size: 0.9rem;">
                Take a photo of your SET game layout and upload it.
            </p>
        </div>
        
        <div class="ios-card">
            <div style="color: #EF4444; font-size: 2rem; margin-bottom: 10px;">●</div>
            <h3>AI Detection</h3>
            <p style="color: #6B7280; font-size: 0.9rem;">
                Our AI analyzes the image to identify all cards and their attributes.
            </p>
        </div>
        
        <div class="ios-card">
            <div style="color: #10B981; font-size: 2rem; margin-bottom: 10px;">▲</div>
            <h3>View Results</h3>
            <p style="color: #6B7280; font-size: 0.9rem;">
                See all valid sets highlighted directly on your image.
            </p>
        </div>
    </div>
    """
    
    # Footer HTML
    footer_html = """
    <div class="footer">
        <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 8px;">
            <span class="set-purple">◆</span>
            <span class="set-red">●</span>
            <span class="set-green">▲</span>
        </div>
        <p>SET Game Detector © 2024</p>
    </div>
    """
    
    # Create the interface
    with gr.Blocks(css=css) as demo:
        gr.HTML(header_html)
        gr.HTML(steps_html)
        
        with gr.Row():
            with gr.Column():
                input_image = gr.Image(type="pil", label="Upload SET Game Image")
                submit_btn = gr.Button("Detect SETs", elem_classes=["upload-btn"])
            
            with gr.Column():
                output_image = gr.Image(type="pil", label="Detected SETs")
                output_text = gr.Textbox(label="Results", lines=5)
        
        submit_btn.click(
            fn=process_image,
            inputs=[input_image],
            outputs=[output_image, output_text]
        )
        
        gr.HTML(footer_html)
    
    return demo

# Launch the app
if __name__ == "__main__":
    # Load models at startup to avoid first-request delay
    _ = load_models()
    
    # Create and launch the interface
    demo = create_interface()
    demo.launch()
