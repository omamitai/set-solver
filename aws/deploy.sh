
#!/bin/bash
# SET Game Detector AWS Deployment Script

# Configuration
STACK_NAME="set-game-detector"
MODEL_BUCKET="set-game-detector-models"
REGION="us-east-1"  # Change to your preferred region
LAMBDA_MEMORY=3008
LAMBDA_TIMEOUT=60

echo "===== SET Game Detector AWS Deployment ====="
echo "This script will deploy the SET Game Detector application to AWS."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "Error: AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check authentication
echo "Verifying AWS credentials..."
aws sts get-caller-identity > /dev/null
if [ $? -ne 0 ]; then
    echo "Error: AWS credentials not configured. Run 'aws configure' first."
    exit 1
fi

# 1. Create/Update CloudFormation stack
echo "Deploying CloudFormation stack..."
aws cloudformation deploy \
    --stack-name $STACK_NAME \
    --template-file cloudformation.yaml \
    --parameter-overrides \
        ModelBucketName=$MODEL_BUCKET \
        LambdaMemory=$LAMBDA_MEMORY \
        LambdaTimeout=$LAMBDA_TIMEOUT \
    --capabilities CAPABILITY_IAM \
    --region $REGION

if [ $? -ne 0 ]; then
    echo "Error: CloudFormation deployment failed."
    exit 1
fi

# 2. Upload models to S3
echo "Uploading ML models to S3..."
if [ ! -d "../models" ]; then
    echo "Error: Models directory not found. Please place your models in the 'models' directory."
    echo "Required structure:"
    echo "models/"
    echo "  Characteristics/11022025/"
    echo "    shape_model.keras"
    echo "    fill_model.keras"
    echo "  Shape/15052024/"
    echo "    best.pt"
    echo "  Card/16042024/"
    echo "    best.pt"
    exit 1
fi

aws s3 sync ../models s3://$MODEL_BUCKET/ --region $REGION

# 3. Package and upload Lambda function
echo "Packaging Lambda function..."
mkdir -p build
cd build
pip install tensorflow torch ultralytics opencv-python-headless numpy boto3 -t .
cp ../lambda_function.py .
zip -r function.zip *

echo "Uploading Lambda package to S3..."
aws s3 cp function.zip s3://$MODEL_BUCKET/lambda/function.zip --region $REGION

# 4. Update Lambda function
echo "Updating Lambda function code..."
aws lambda update-function-code \
    --function-name SetGameDetector \
    --s3-bucket $MODEL_BUCKET \
    --s3-key lambda/function.zip \
    --region $REGION

# 5. Get API endpoint
API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
    --output text \
    --region $REGION)

echo ""
echo "===== Deployment Complete ====="
echo "API Endpoint: $API_ENDPOINT"
echo ""
echo "To configure your frontend:"
echo "1. Update .env file with:"
echo "   REACT_APP_AWS_API_ENDPOINT=$API_ENDPOINT"
echo "2. Set REACT_APP_USE_MOCK_DATA=false"
echo "3. Build and deploy your frontend"
echo ""
echo "Happy SET detecting!"
