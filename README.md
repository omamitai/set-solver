
# SET Game Detector

An AI-powered web application that identifies valid SET card combinations from uploaded images.

## Overview

SET Game Detector uses computer vision and deep learning to analyze images of SET card games, identify all cards on the table, and highlight valid SET combinations. This project includes:

- A React frontend with a user-friendly interface
- A Python backend that runs the SET detection algorithms
- Support for deployment on AWS EC2 or AWS Lambda + API Gateway

## Frontend Setup

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Configure the `.env` file:
   - For development: Set `REACT_APP_USE_MOCK_DATA=true`
   - For production: Set `REACT_APP_USE_MOCK_DATA=false` and configure the appropriate backend URL

5. Start the development server:
   ```bash
   npm run dev
   ```

## Backend Deployment Options

### Option 1: EC2 Deployment

1. Launch an EC2 instance (Ubuntu 20.04+ recommended, t2.medium or larger)
2. Configure security groups to allow inbound traffic on ports 22, 80, and 443
3. Connect to your instance via SSH
4. Upload necessary files to your instance:
   ```bash
   scp -i your-key.pem server.py requirements.txt ec2_setup.sh ubuntu@your-ec2-ip:~/
   chmod +x ec2_setup.sh
   ./ec2_setup.sh
   ```
5. Upload your trained models to the appropriate directories
6. Update your frontend `.env` file:
   ```
   REACT_APP_USE_MOCK_DATA=false
   REACT_APP_EC2_SERVER_URL=http://your-ec2-public-ip/detect-sets
   ```

### Option 2: AWS Serverless Deployment

1. Install the AWS CLI and configure it with your credentials
2. Deploy using CloudFormation:
   ```bash
   cd aws
   ./deploy.sh
   ```
3. Upload your trained models to the S3 bucket created by CloudFormation
4. Update your frontend `.env` file:
   ```
   REACT_APP_USE_MOCK_DATA=false
   REACT_APP_AWS_API_ENDPOINT=https://your-api-gateway-endpoint
   ```

## ML Models

This application requires the following models:

- Card detector (YOLO model): `models/Card/16042024/best.pt`
- Shape detector (YOLO model): `models/Shape/15052024/best.pt`
- Shape classifier (Keras model): `models/Characteristics/11022025/shape_model.keras`
- Fill classifier (Keras model): `models/Characteristics/11022025/fill_model.keras`

## Building for Production

To build the frontend for production:

```bash
npm run build
```

The built files will be in the `dist` directory and can be deployed to any static hosting service like AWS S3 + CloudFront, Netlify, or Vercel.

## Architecture

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Flask API or AWS Lambda
- **ML Stack**: TensorFlow, PyTorch, YOLO, OpenCV

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- SET is a registered trademark of Set Enterprises, Inc.
- This project is for educational purposes only.
