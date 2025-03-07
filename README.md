
# SET Game Detector

An AI-powered web application that identifies valid SET card combinations from uploaded images.

## Overview

SET Game Detector uses computer vision to analyze images of SET card games and highlight valid SET combinations. The application consists of a React frontend and Python backend, with a simplified deployment process.

## Project Structure

```
set-detector/
├── src/                       # Frontend source code (React)
│   ├── core/                  # Core functionality
│   │   └── setDetector.js     # API communication module
│   ├── components/            # React components
│   └── pages/                 # Page components
├── server.py                  # Python backend server
├── setup.sh                   # EC2 deployment script
└── .env.example               # Environment variable template
```

## Quick Start for Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

4. For development (no backend needed):
   ```
   VITE_USE_MOCK_DATA=true
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## EC2 Deployment Guide

### 1. Prepare Your EC2 Instance

Launch an Ubuntu EC2 instance (t2.medium or larger) with HTTP (80) and SSH (22) ports open.

### 2. Configure Everything with One Command

1. Connect to your instance:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-public-ip
   ```

2. Upload and run the setup script:
   ```bash
   # Upload setup script and server
   scp -i your-key.pem setup.sh server.py ubuntu@your-ec2-public-ip:~/

   # Make executable and run
   ssh -i your-key.pem ubuntu@your-ec2-public-ip "chmod +x ~/setup.sh && ./setup.sh"
   ```

   The script automatically:
   - Installs all required dependencies
   - Sets up the Python environment
   - Configures Nginx as a reverse proxy
   - Sets up the backend service
   - Configures the firewall

### 3. Build and Deploy the Frontend

1. Update `.env` for production:
   ```
   VITE_USE_MOCK_DATA=false
   VITE_BACKEND_URL=http://your-ec2-public-ip/api/detect-sets
   ```

2. Build the frontend:
   ```bash
   npm run build
   ```

3. Upload the build to your EC2 instance:
   ```bash
   scp -i your-key.pem -r dist/* ubuntu@your-ec2-public-ip:~/set-detector/build/
   ```

### 4. Access Your Application

Open `http://your-ec2-public-ip` in your browser.

## Environment Variables

The application only requires two environment variables:

- `VITE_USE_MOCK_DATA`: Set to 'true' for development without a backend, 'false' for production
- `VITE_BACKEND_URL`: The URL of the backend API endpoint (only needed when `VITE_USE_MOCK_DATA=false`)

## Troubleshooting

- Check backend logs: `sudo journalctl -u set-detector`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Restart the service: `sudo systemctl restart set-detector`

## License

This project is licensed under the MIT License. SET is a registered trademark of Set Enterprises, Inc.
