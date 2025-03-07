
# SET Game Detector

An AI-powered web application that identifies valid SET card combinations from uploaded images.

## Overview

SET Game Detector uses computer vision and deep learning to analyze images of SET card games, identify all cards on the table, and highlight valid SET combinations.

## Simplified Architecture

- **Frontend**: React + TypeScript app that uploads images and displays results
- **Backend**: Python Flask server with ML models for SET detection
- **Deployment**: Single EC2 instance with Nginx for serving both frontend and backend

## Quick Start

### Development Setup

1. Clone this repository
2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. For development, set:
   ```
   REACT_APP_USE_MOCK_DATA=true
   ```

5. Start the frontend development server:
   ```bash
   npm run dev
   ```

### Production Deployment on EC2

1. Launch an EC2 instance (Ubuntu recommended, t2.medium or larger)
2. SSH into your instance
3. Clone this repository on your instance
4. Run the setup script:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

5. Upload your model files to the specified locations
6. Upload frontend build to the web root:
   ```bash
   sudo rm -rf /var/www/html/*
   sudo cp -r build/* /var/www/html/
   ```

7. Update your `.env` file for production before building:
   ```
   REACT_APP_USE_MOCK_DATA=false
   REACT_APP_BACKEND_URL=http://your-ec2-public-ip/api/detect-sets
   ```

### Model Files

You need to have the following model files:
- `models/Characteristics/11022025/shape_model.keras`
- `models/Characteristics/11022025/fill_model.keras`
- `models/Shape/15052024/best.pt`
- `models/Card/16042024/best.pt`

## Troubleshooting

### Common Issues

- **Backend not responding**: Check if the service is running with `sudo systemctl status set-detector`
- **Models not loading**: Verify model files exist and have correct permissions
- **Frontend can't connect to backend**: Check your `.env` file and make sure Nginx is configured correctly

### Logs

- Backend logs: `journalctl -u set-detector`
- Nginx logs: `/var/log/nginx/access.log` and `/var/log/nginx/error.log`

## Security Recommendations

- Set up SSL with Let's Encrypt for production
- Restrict access to your EC2 instance using security groups
- Keep packages up to date

## License

This project is licensed under the MIT License. SET is a registered trademark of Set Enterprises, Inc.
