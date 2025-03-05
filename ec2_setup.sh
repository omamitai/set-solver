
#!/bin/bash

# SET Game Detector EC2 Setup Script
# Production-ready setup for EC2 instances

# Exit on any error
set -e

# Color codes for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}====== SET Game Detector EC2 Setup ======${NC}"

# Update system packages
echo -e "${YELLOW}Updating system packages...${NC}"
sudo apt-get update -y
sudo apt-get upgrade -y

# Install required system dependencies
echo -e "${YELLOW}Installing system dependencies...${NC}"
sudo apt-get install -y python3-pip python3-dev python3-venv libgl1-mesa-glx libglib2.0-0 git nginx certbot python3-certbot-nginx

# Create project directory
echo -e "${YELLOW}Creating project directory...${NC}"
mkdir -p ~/set-game-detector
cd ~/set-game-detector

# Create and activate virtual environment
echo -e "${YELLOW}Setting up Python virtual environment...${NC}"
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo -e "${YELLOW}Installing Python dependencies (this may take a while)...${NC}"
pip install --upgrade pip
pip install gunicorn
pip install flask flask-cors numpy opencv-python-headless pandas tensorflow torch ultralytics Pillow

# Create models directory structure
echo -e "${YELLOW}Creating models directory structure...${NC}"
mkdir -p models/Characteristics/11022025
mkdir -p models/Shape/15052024
mkdir -p models/Card/16042024

# Create systemd service file
echo -e "${YELLOW}Creating systemd service...${NC}"
sudo bash -c 'cat > /etc/systemd/system/set-detector.service << EOL
[Unit]
Description=SET Game Detector Service
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/set-game-detector
ExecStart=/home/ubuntu/set-game-detector/venv/bin/gunicorn --workers 2 --timeout 120 --bind 0.0.0.0:8000 server:app
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=set-detector
Environment="PYTHONUNBUFFERED=1"

[Install]
WantedBy=multi-user.target
EOL'

# Create Nginx configuration
echo -e "${YELLOW}Setting up Nginx configuration...${NC}"
sudo bash -c 'cat > /etc/nginx/sites-available/set-detector << EOL
server {
    listen 80;
    server_name _;  # Replace with your actual domain if you have one

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket support (if needed)
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeout settings
        proxy_connect_timeout 75s;
        proxy_read_timeout 300s;
        
        # CORS settings (if needed)
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
EOL'

# Enable the site
sudo ln -sf /etc/nginx/sites-available/set-detector /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Enable and start services
echo -e "${YELLOW}Enabling and starting services...${NC}"
sudo systemctl daemon-reload
sudo systemctl enable set-detector
sudo systemctl start set-detector
sudo systemctl enable nginx
sudo systemctl restart nginx

# Configure firewall
echo -e "${YELLOW}Configuring firewall...${NC}"
sudo ufw allow 'Nginx Full'
sudo ufw allow 22/tcp
sudo ufw --force enable
sudo ufw status

# Setup logrotate to manage logs
echo -e "${YELLOW}Setting up log rotation...${NC}"
sudo bash -c 'cat > /etc/logrotate.d/set-detector << EOL
/home/ubuntu/set-game-detector/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 ubuntu ubuntu
}
EOL'

# Create startup script
echo -e "${YELLOW}Creating startup script...${NC}"
cat > ~/set-game-detector/start.sh << EOL
#!/bin/bash
cd ~/set-game-detector
source venv/bin/activate
gunicorn --workers 2 --timeout 120 --bind 0.0.0.0:8000 server:app
EOL
chmod +x ~/set-game-detector/start.sh

echo -e "${GREEN}====== SET Game Detector Setup Complete ======${NC}"
echo -e "${YELLOW}IMPORTANT: You need to upload the model files to the following locations:${NC}"
echo -e "- models/Characteristics/11022025/shape_model.keras"
echo -e "- models/Characteristics/11022025/fill_model.keras"
echo -e "- models/Shape/15052024/best.pt" 
echo -e "- models/Card/16042024/best.pt"
echo -e ""
echo -e "${YELLOW}After uploading models, restart the service:${NC}"
echo -e "sudo systemctl restart set-detector"
echo -e ""
echo -e "${YELLOW}Your server is now accessible at:${NC}"
echo -e "http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'YOUR-EC2-PUBLIC-IP')"
echo -e ""
echo -e "${YELLOW}To configure your frontend:${NC}"
echo -e "Update your .env file with:"
echo -e "REACT_APP_USE_MOCK_DATA=false"
echo -e "REACT_APP_EC2_SERVER_URL=http://YOUR-EC2-PUBLIC-IP/detect-sets"
echo -e ""
echo -e "${GREEN}==========================================${NC}"
