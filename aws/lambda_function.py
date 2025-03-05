
"""
SET Game Detector AWS Lambda Function

This file is designed to be deployed as an AWS Lambda function that processes 
SET game images. It connects to API Gateway and can be triggered via HTTP requests.

Deployment steps are in the README.md file.
"""

import json
import base64
import numpy as np
import cv2
import boto3
import os
from io import BytesIO
import tensorflow as tf
from tensorflow.keras.models import load_model
from ultralytics import YOLO

# Initialize the S3 client for loading models
s3 = boto3.client('s3')

# Path configurations
MODEL_BUCKET = os.environ.get('MODEL_BUCKET', 'your-model-bucket')
LOCAL_MODEL_PATH = '/tmp/models'  # Lambda's writable directory

# Global variables for models
models = {
    'model_shape': None,
    'model_fill': None,
    'detector_card': None,
    'detector_shape': None
}

def download_models_from_s3():
    """Download models from S3 to Lambda's tmp directory"""
    if not os.path.exists(LOCAL_MODEL_PATH):
        os.makedirs(LOCAL_MODEL_PATH)
        
    # Create directory structure
    for path in ['Characteristics/11022025', 'Shape/15052024', 'Card/16042024']:
        full_path = f"{LOCAL_MODEL_PATH}/{path}"
        if not os.path.exists(full_path):
            os.makedirs(full_path)
    
    # Download models
    model_files = [
        {'key': 'Characteristics/11022025/shape_model.keras', 'local': f"{LOCAL_MODEL_PATH}/Characteristics/11022025/shape_model.keras"},
        {'key': 'Characteristics/11022025/fill_model.keras', 'local': f"{LOCAL_MODEL_PATH}/Characteristics/11022025/fill_model.keras"},
        {'key': 'Shape/15052024/best.pt', 'local': f"{LOCAL_MODEL_PATH}/Shape/15052024/best.pt"},
        {'key': 'Card/16042024/best.pt', 'local': f"{LOCAL_MODEL_PATH}/Card/16042024/best.pt"}
    ]
    
    for model in model_files:
        if not os.path.exists(model['local']):
            print(f"Downloading {model['key']} from S3")
            s3.download_file(MODEL_BUCKET, model['key'], model['local'])

def load_models():
    """Load models into memory"""
    global models
    
    # Make sure models are downloaded
    download_models_from_s3()
    
    # Load classification models
    char_path = f"{LOCAL_MODEL_PATH}/Characteristics/11022025"
    shape_path = f"{LOCAL_MODEL_PATH}/Shape/15052024"
    card_path = f"{LOCAL_MODEL_PATH}/Card/16042024"
    
    models['model_shape'] = load_model(f"{char_path}/shape_model.keras")
    models['model_fill'] = load_model(f"{char_path}/fill_model.keras")
    
    # Load detection models
    models['detector_shape'] = YOLO(f"{shape_path}/best.pt")
    models['detector_shape'].conf = 0.5
    models['detector_card'] = YOLO(f"{card_path}/best.pt")
    models['detector_card'].conf = 0.5

# This part is exactly as in your python/app.py file
# ... keep existing core functions from python/app.py (process_image, detect_cards, etc) ...

def lambda_handler(event, context):
    """AWS Lambda handler function"""
    try:
        # Load models if not already loaded
        if models['model_shape'] is None:
            load_models()
        
        # Get the image from the event
        if 'body' in event:
            if isinstance(event['body'], str):
                body = json.loads(event['body'])
            else:
                body = event['body']
                
            # Extract base64 image from the request
            image_data = body.get('image', '')
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
                
            # Decode the image
            image_bytes = base64.b64decode(image_data)
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # Process the image using the functions from your original Python app
            # ... call your SET detection functions here ...
            
            # For now, we'll return a mock response
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'setCount': 3,  # Replace with actual results
                    'image': 'data:image/jpeg;base64,...'  # Replace with actual processed image
                })
            }
        else:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'Invalid request format'
                })
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': str(e)
            })
        }
