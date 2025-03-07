
#!/bin/bash
# SET Game Detector Deployment Script

# Exit on any error
set -e

# Text formatting
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
EC2_USER="ubuntu"
EC2_HOST=""
APP_DIR="~/set-detector"

# Check if EC2 host is provided
if [ -z "$1" ]; then
  echo -e "${RED}Error: EC2 instance IP or hostname not provided${NC}"
  echo -e "Usage: ./deploy.sh <ec2-ip-or-hostname>"
  exit 1
else
  EC2_HOST="$1"
fi

echo -e "${GREEN}====== SET Game Detector Deployment ======${NC}"
echo -e "${YELLOW}Building frontend...${NC}"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  npm install
fi

# Build the frontend
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
  echo -e "${RED}Error: Build failed. dist directory not found${NC}"
  exit 1
fi

echo -e "${YELLOW}Packaging deployment files...${NC}"
mkdir -p deploy

# Copy necessary files to deploy folder
cp -r dist deploy/
cp requirements.txt deploy/
cp server.py deploy/
cp setup.sh deploy/
cp -r models deploy/ 2>/dev/null || echo "No models directory found"

# Create deployment archive
tar -czf set-detector.tar.gz -C deploy .

echo -e "${YELLOW}Deploying to EC2 instance (${EC2_HOST})...${NC}"

# Copy files to server
scp set-detector.tar.gz "${EC2_USER}@${EC2_HOST}:~/"

# Run setup on server
ssh "${EC2_USER}@${EC2_HOST}" << EOF
mkdir -p ~/set-detector
tar -xzf ~/set-detector.tar.gz -C ~/set-detector
cd ~/set-detector
chmod +x setup.sh
./setup.sh
EOF

# Clean up temporary files
rm -rf deploy
rm set-detector.tar.gz

echo -e "${GREEN}====== Deployment Complete ======${NC}"
echo -e "The SET Game Detector application has been deployed to ${EC2_HOST}"
echo -e "Access the application at: http://${EC2_HOST}"
echo -e "${GREEN}====================================${NC}"
