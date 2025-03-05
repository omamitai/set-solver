
#!/bin/bash

# EC2 Setup Script for SET Game Detector
# Run this script on your EC2 instance after connecting via SSH

# Update system packages
echo "Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# Install required system dependencies
echo "Installing system dependencies..."
sudo apt-get install -y python3-pip python3-dev python3-venv libgl1-mesa-glx libglib2.0-0 git

# Create project directory
echo "Creating project directory..."
mkdir -p ~/set-game-detector
cd ~/set-game-detector

# Clone the repository if not already present
if [ ! -f "server.py" ]; then
    echo "Downloading project files..."
    # You can add a git clone command here if your code is in a repository
    # git clone https://github.com/yourusername/set-game-detector.git .
fi

# Create and activate virtual environment
echo "Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies (this may take a while)..."
pip install --upgrade pip
pip install -r requirements.txt

# Create models directory structure
echo "Creating models directory structure..."
mkdir -p models/Characteristics/11022025
mkdir -p models/Shape/15052024
mkdir -p models/Card/16042024

echo "IMPORTANT: You need to upload the model files to the following locations:"
echo "- models/Characteristics/11022025/shape_model.keras"
echo "- models/Characteristics/11022025/fill_model.keras"
echo "- models/Shape/15052024/best.pt"
echo "- models/Card/16042024/best.pt"

# Set up Systemd service for automatic startup
echo "Setting up systemd service..."
sudo bash -c 'cat > /etc/systemd/system/set-detector.service << EOL
[Unit]
Description=SET Game Detector Service
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/set-game-detector
ExecStart=/home/ubuntu/set-game-detector/venv/bin/gunicorn --bind 0.0.0.0:8000 server:app
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=set-detector

[Install]
WantedBy=multi-user.target
EOL'

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable set-detector
sudo systemctl start set-detector

# Set up firewall if needed
echo "Configuring firewall to allow traffic on port 8000..."
sudo ufw allow 8000/tcp
sudo ufw status

echo "========================================================"
echo "SET Game Detector EC2 setup complete!"
echo "The server should now be running at http://YOUR-EC2-IP:8000"
echo "Remember to:"
echo "1. Upload your model files to the models directory"
echo "2. Configure your security group to allow inbound traffic on port 8000"
echo "3. Update your frontend .env file with your EC2 public DNS or IP address"
echo "========================================================"
