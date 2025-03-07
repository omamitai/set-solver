
#!/bin/bash
# Simplified SET Game Detector Setup Script for EC2

# Exit on any error
set -e

# Text formatting
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}====== SET Game Detector EC2 Setup ======${NC}"

# Update system packages
echo -e "${YELLOW}Updating system packages...${NC}"
sudo apt-get update -y
sudo apt-get upgrade -y

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
sudo apt-get install -y python3-pip python3-dev python3-venv libgl1-mesa-glx \
  libglib2.0-0 nginx certbot python3-certbot-nginx

# Create project directory
echo -e "${YELLOW}Setting up project directory...${NC}"
mkdir -p ~/set-detector
cd ~/set-detector

# Create Python virtual environment
echo -e "${YELLOW}Creating Python virtual environment...${NC}"
python3 -m venv venv
source venv/bin/activate

# Install Python packages
echo -e "${YELLOW}Installing Python packages...${NC}"
pip install --upgrade pip
pip install -r requirements.txt

# Create model directories
echo -e "${YELLOW}Creating model directories...${NC}"
mkdir -p models/Characteristics/11022025
mkdir -p models/Shape/15052024
mkdir -p models/Card/16042024

# Set up Nginx
echo -e "${YELLOW}Configuring Nginx...${NC}"
sudo bash -c 'cat > /etc/nginx/sites-available/set-detector << EOL
server {
    listen 80;
    server_name _;

    location / {
        root /var/www/html;
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeout settings
        proxy_connect_timeout 75s;
        proxy_read_timeout 300s;
    }

    location /health {
        proxy_pass http://localhost:8000/health;
    }
}
EOL'

# Enable the Nginx site
sudo ln -sf /etc/nginx/sites-available/set-detector /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Create systemd service
echo -e "${YELLOW}Creating systemd service...${NC}"
sudo bash -c 'cat > /etc/systemd/system/set-detector.service << EOL
[Unit]
Description=SET Game Detector Service
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/set-detector
ExecStart=/home/ubuntu/set-detector/venv/bin/gunicorn --workers 2 --timeout 120 --bind 0.0.0.0:8000 server:app
Restart=always
RestartSec=10
Environment="PYTHONUNBUFFERED=1"

[Install]
WantedBy=multi-user.target
EOL'

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable set-detector
sudo systemctl start set-detector

# Set up firewall
echo -e "${YELLOW}Configuring firewall...${NC}"
sudo ufw allow 'Nginx Full'
sudo ufw allow 22/tcp
sudo ufw --force enable

echo -e "${GREEN}====== Installation Complete ======${NC}"
echo -e "The SET Game Detector server is now running."
echo -e ""
echo -e "${YELLOW}IMPORTANT:${NC} Upload your model files to these locations:"
echo -e "- ~/set-detector/models/Characteristics/11022025/shape_model.keras"
echo -e "- ~/set-detector/models/Characteristics/11022025/fill_model.keras"
echo -e "- ~/set-detector/models/Shape/15052024/best.pt"
echo -e "- ~/set-detector/models/Card/16042024/best.pt"
echo -e ""
echo -e "After uploading models, restart the service with:"
echo -e "sudo systemctl restart set-detector"
echo -e ""
echo -e "Your server is now accessible at:"
echo -e "http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'YOUR-EC2-PUBLIC-IP')"
echo -e ""
echo -e "To deploy the frontend, upload your build files to: /var/www/html"
echo -e ""
echo -e "${GREEN}==========================================${NC}"
