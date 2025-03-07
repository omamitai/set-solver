
# SET Game Detector

An AI-powered web application that identifies valid SET card combinations from uploaded images.

## Overview

SET Game Detector is a simple application that uses computer vision to analyze images of SET card games and highlight valid SET combinations. The system consists of:

1. **Frontend**: React app for uploading images and displaying results
2. **Backend**: Flask server that processes images and detects SETs

## Project Structure

```
set-detector/
├── src/                     # Frontend source code
│   ├── core/                # Core functionality
│   │   └── setDetector.js   # Handles API communication
│   ├── components/          # React components
│   └── pages/               # Page components
├── server.py                # Backend Flask server
├── setup.sh                 # EC2 deployment script
├── requirements.txt         # Python dependencies
└── .env.example             # Example environment variables
```

## Quick Start for Development

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
   VITE_USE_MOCK_DATA=true
   ```

5. Start the frontend development server:
   ```bash
   npm run dev
   ```

## EC2 Deployment Guide

### 1. Launch an EC2 Instance

1. Launch an Ubuntu EC2 instance (t2.medium or larger recommended)
2. Configure security groups to allow HTTP (80) and SSH (22)
3. Connect to your instance:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-public-ip
   ```

### 2. Deploy the Application

1. Upload the setup script to your EC2 instance:
   ```bash
   scp -i your-key.pem setup.sh ubuntu@your-ec2-public-ip:~/
   ```

2. Upload the server code:
   ```bash
   scp -i your-key.pem server.py requirements.txt ubuntu@your-ec2-public-ip:~/
   ```

3. SSH into your instance and run the setup script:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-public-ip
   chmod +x setup.sh
   ./setup.sh
   ```

4. Build the frontend locally:
   ```bash
   # Update .env for production
   echo "VITE_USE_MOCK_DATA=false" > .env
   echo "VITE_BACKEND_URL=http://your-ec2-public-ip/api/detect-sets" >> .env
   
   # Build
   npm run build
   ```

5. Upload the built frontend:
   ```bash
   scp -i your-key.pem -r dist/* ubuntu@your-ec2-public-ip:~/set-detector/build/
   ```

6. Restart the service:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-public-ip "sudo systemctl restart set-detector"
   ```

7. Access your application at `http://your-ec2-public-ip`

## Configuration Options

- `VITE_USE_MOCK_DATA`: Set to 'true' for development, 'false' for production
- `VITE_BACKEND_URL`: The URL of the backend API endpoint

## Troubleshooting

### Common Issues

- **Backend not responding**: Check if the service is running with `sudo systemctl status set-detector`
- **Frontend can't connect to backend**: Verify your `.env` file has the correct backend URL
- **Permission errors**: Ensure the service user has appropriate permissions

### Logs

- Backend logs: `sudo journalctl -u set-detector`
- Nginx logs: `/var/log/nginx/access.log` and `/var/log/nginx/error.log`

## License

This project is licensed under the MIT License. SET is a registered trademark of Set Enterprises, Inc.
