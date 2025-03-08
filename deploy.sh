
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
USE_MOCK_DATA="false"  # Set to true if you want to use mock data in production

# Check if EC2 host is provided
if [ -z "$1" ]; then
  echo -e "${RED}Error: EC2 instance IP or hostname not provided${NC}"
  echo -e "Usage: ./deploy.sh <ec2-ip-or-hostname> [use-mock-data]"
  exit 1
else
  EC2_HOST="$1"
fi

# Check if mock data flag is provided
if [ ! -z "$2" ] && [ "$2" = "mock" ]; then
  USE_MOCK_DATA="true"
  echo -e "${YELLOW}Warning: Using mock data mode for deployment!${NC}"
fi

echo -e "${GREEN}====== SET Game Detector Deployment ======${NC}"
echo -e "${YELLOW}Building frontend...${NC}"

# Update .env for production
cat > .env << EOF
# SET Game Detector Configuration

# Development Mode: Set to 'true' to use mock data (no backend needed)
VITE_USE_MOCK_DATA=${USE_MOCK_DATA}

# Production Backend URL (only needed when VITE_USE_MOCK_DATA=false)
VITE_BACKEND_URL=http://${EC2_HOST}/api/detect-sets

# Lovable Compatible Configuration
NODE_ENV=production
EOF

echo -e "${YELLOW}Created production .env file:${NC}"
cat .env

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing Node.js dependencies...${NC}"
  npm install
fi

# Build the frontend
echo -e "${YELLOW}Building production frontend...${NC}"
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

# Check if models directory exists and copy if using real models
if [ "$USE_MOCK_DATA" = "false" ] && [ -d "models" ]; then
  echo -e "${YELLOW}Copying ML models for production...${NC}"
  cp -r models deploy/ 
else
  echo -e "${YELLOW}Skipping models directory (using mock data)${NC}"
fi

# Create deployment archive
echo -e "${YELLOW}Creating deployment archive...${NC}"
tar -czf set-detector.tar.gz -C deploy .

echo -e "${YELLOW}Deploying to EC2 instance (${EC2_HOST})...${NC}"

# Copy files to server
scp set-detector.tar.gz "${EC2_USER}@${EC2_HOST}:~/"

# Create .env file for server deployment
cat > server_env.txt << EOF
USE_MOCK_DATA=${USE_MOCK_DATA}
EOF

# Copy .env file to server
scp server_env.txt "${EC2_USER}@${EC2_HOST}:~/env.txt"

# Run setup on server
ssh "${EC2_USER}@${EC2_HOST}" << EOF
mkdir -p ~/set-detector
tar -xzf ~/set-detector.tar.gz -C ~/set-detector
cd ~/set-detector
chmod +x setup.sh
export USE_MOCK_DATA=\$(grep USE_MOCK_DATA ~/env.txt | cut -d= -f2)
./setup.sh
rm ~/env.txt
EOF

# Clean up temporary files
rm -rf deploy
rm set-detector.tar.gz
rm server_env.txt

echo -e "${GREEN}====== Deployment Complete ======${NC}"
echo -e "The SET Game Detector application has been deployed to ${EC2_HOST}"
echo -e "Access the application at: http://${EC2_HOST}"
echo -e "API Health Check: http://${EC2_HOST}/api/health"
echo -e "${GREEN}====================================${NC}"

# Show deployed environment mode
if [ "$USE_MOCK_DATA" = "true" ]; then
  echo -e "${YELLOW}Note: The application is running in MOCK DATA mode.${NC}"
  echo -e "${YELLOW}No actual SET detection will be performed.${NC}"
else
  echo -e "${GREEN}The application is running in PRODUCTION mode with real SET detection.${NC}"
fi
