
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
- **Backend**: AWS Lambda, API Gateway, S3
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
├── models/               # ML models (add these before deployment)
│   ├── Characteristics/
│   │   └── 11022025/     # Shape and fill models
│   ├── Shape/
│   │   └── 15052024/     # Shape detection models
│   └── Card/
│       └── 16042024/     # Card detection models
└── aws/                  # AWS deployment files
    ├── lambda_function.py # Lambda handler
    ├── cloudformation.yaml # Infrastructure as code
    └── deploy.sh         # Deployment script
```

## AWS Deployment Guide

### Prerequisites

1. AWS Account
2. AWS CLI installed and configured (`aws configure`)
3. Python 3.9+
4. The SET detection ML models in the correct directory structure

### Step 1: Prepare your ML Models

Before deployment, create a directory structure for your ML models:

```
models/
├── Characteristics/
│   └── 11022025/
│       ├── shape_model.keras
│       └── fill_model.keras
├── Shape/
│   └── 15052024/
│       └── best.pt
└── Card/
    └── 16042024/
        └── best.pt
```

Place your trained models in these locations.

### Step 2: Deploy AWS Backend

1. Navigate to the AWS directory:
   ```
   cd aws
   ```

2. Make the deployment script executable:
   ```
   chmod +x deploy.sh
   ```

3. Run the deployment script:
   ```
   ./deploy.sh
   ```

   This script will:
   - Create an S3 bucket for your models
   - Deploy a CloudFormation stack with Lambda and API Gateway
   - Upload your ML models to S3
   - Package and deploy your Lambda function
   - Output the API endpoint URL

4. Take note of the API endpoint URL displayed at the end of the deployment.

### Step 3: Configure Frontend

1. Create a `.env` file in the project root (or update the existing one):
   ```
   REACT_APP_USE_MOCK_DATA=false
   REACT_APP_AWS_API_ENDPOINT=<your-api-endpoint-url>
   ```

   Replace `<your-api-endpoint-url>` with the URL from Step 2.

2. Update `src/core/setDetector.js` to use the actual API endpoint:
   - Make sure `USE_MOCK_DATA` is set to `false` to use the AWS backend

### Step 4: Build and Deploy Frontend

1. Build the React app:
   ```
   npm run build
   ```

2. Deploy the frontend to your preferred hosting service:
   - AWS Amplify (easiest for AWS integration)
   - AWS S3 + CloudFront
   - Vercel
   - Netlify
   - Any static hosting service

## Troubleshooting

### Lambda Function Issues

If your Lambda function is failing, check these common issues:

1. **Memory limit**: The default is 3008MB but you may need to increase it for model loading
2. **Timeout**: The default is 60 seconds, increase if processing takes longer
3. **CloudWatch Logs**: Check the Lambda logs for detailed error messages

### Model Loading Issues

If the models aren't loading correctly:

1. Verify that all models are uploaded to S3
2. Verify the model paths in `lambda_function.py`
3. Ensure your models are compatible with the TensorFlow and PyTorch versions used in Lambda

## Local Development

For local development, you can:

1. Use mock data by setting `REACT_APP_USE_MOCK_DATA=true` in `.env`
2. Start the development server:
   ```
   npm run dev
   ```

## License

MIT
