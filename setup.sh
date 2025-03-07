
#!/bin/bash
# SET Game Detector Setup Script for EC2

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
  libglib2.0-0 nginx certbot python3-certbot-nginx git

# Create project directory
echo -e "${YELLOW}Setting up project directory...${NC}"
mkdir -p ~/set-detector
cd ~/set-detector

# Clone the repository or create structure if it doesn't exist
if [ ! -f "server.py" ]; then
  echo -e "${YELLOW}Initializing project structure...${NC}"
  touch server.py
  mkdir -p dist
fi

# Create Python virtual environment
echo -e "${YELLOW}Creating Python virtual environment...${NC}"
python3 -m venv venv
source venv/bin/activate

# Install Python packages
echo -e "${YELLOW}Installing Python packages...${NC}"
pip install --upgrade pip
pip install -r requirements.txt

# Copy server.py and frontend files
echo -e "${YELLOW}Copying application files...${NC}"
# Copy server.py and dist/ directory from your deployment package

# Set up Nginx
echo -e "${YELLOW}Configuring Nginx...${NC}"
sudo bash -c 'cat > /etc/nginx/sites-available/set-detector << EOL
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeout settings
        proxy_connect_timeout 75s;
        proxy_read_timeout 300s;
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
Environment="USE_MOCK_DATA=false"

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
echo -e "${YELLOW}Your server is now accessible at:${NC}"
echo -e "http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'YOUR-EC2-PUBLIC-IP')"
echo -e ""
echo -e "${YELLOW}To manage the service:${NC}"
echo -e "sudo systemctl status set-detector  # Check status"
echo -e "sudo systemctl restart set-detector # Restart service"
echo -e "sudo systemctl stop set-detector    # Stop service"
echo -e "sudo journalctl -u set-detector     # View logs"
echo -e ""
echo -e "${GREEN}==========================================${NC}"
