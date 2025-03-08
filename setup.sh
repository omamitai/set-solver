
#!/bin/bash
# SET Game Detector EC2 Setup Script

# Exit on any error
set -e

# Text formatting
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}====== SET Game Detector Setup ======${NC}"
echo -e "${YELLOW}Setting up the SET Game Detector on EC2...${NC}"

# Update system packages
echo -e "${YELLOW}Updating system packages...${NC}"
sudo apt-get update && sudo apt-get upgrade -y

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
sudo apt-get install -y python3-pip python3-venv nginx

# Set up Python virtual environment
echo -e "${YELLOW}Setting up Python environment...${NC}"
python3 -m venv venv
source venv/bin/activate

# Install Python requirements
echo -e "${YELLOW}Installing Python packages...${NC}"
pip install -r requirements.txt

# If we're in mock mode, we don't need to install the ML model dependencies
USE_MOCK_DATA=${USE_MOCK_DATA:-true}
if [ "$USE_MOCK_DATA" = "false" ]; then
    echo -e "${YELLOW}Installing ML dependencies...${NC}"
    pip install tensorflow torch ultralytics opencv-python-headless
fi

# Set up systemd service for the backend
echo -e "${YELLOW}Configuring systemd service...${NC}"
SERVICE_FILE="/etc/systemd/system/set-detector.service"
sudo bash -c "cat > $SERVICE_FILE" << EOF
[Unit]
Description=SET Game Detector Backend
After=network.target

[Service]
User=$(whoami)
WorkingDirectory=$PWD
ExecStart=$PWD/venv/bin/gunicorn --workers 2 --timeout 120 --bind 0.0.0.0:8000 server:app
Restart=always
StandardOutput=journal
StandardError=journal
Environment="PATH=$PWD/venv/bin:$PATH"
Environment="USE_MOCK_DATA=$USE_MOCK_DATA"

[Install]
WantedBy=multi-user.target
EOF

# Configure Nginx
echo -e "${YELLOW}Configuring Nginx...${NC}"
NGINX_CONF="/etc/nginx/sites-available/set-detector"
sudo bash -c "cat > $NGINX_CONF" << EOF
server {
    listen 80;
    server_name _;

    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        root $PWD/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

# Enable the Nginx site
sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Create the dist directory if it doesn't exist
mkdir -p dist

# Validate Nginx configuration
sudo nginx -t

# Reload systemd, start services
echo -e "${YELLOW}Starting services...${NC}"
sudo systemctl daemon-reload
sudo systemctl enable set-detector
sudo systemctl start set-detector
sudo systemctl restart nginx

echo -e "${GREEN}====== Setup Complete ======${NC}"
echo -e "The SET Game Detector is now installed and running!"
echo -e "Access the application at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)/"
echo -e "${GREEN}====================================${NC}"
