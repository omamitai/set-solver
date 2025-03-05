
# SET Game Detector EC2 Deployment Guide

This guide explains how to deploy the SET Game Detector application on an Amazon EC2 instance.

## Prerequisites

1. An AWS account
2. Basic knowledge of AWS EC2
3. SSH client (Terminal on macOS/Linux, PuTTY on Windows)
4. The SET Game Detector code repository

## Step 1: Launch an EC2 Instance

1. Sign in to the AWS Management Console and navigate to EC2
2. Click "Launch Instance"
3. Choose an Ubuntu Server 20.04 LTS (or newer) AMI
4. Select an instance type (recommended: t2.medium or larger for ML workloads)
5. Configure instance details (default settings are usually fine)
6. Add storage (recommended: at least 20GB)
7. Configure security group:
   - Allow SSH (port 22) from your IP
   - Allow HTTP (port 80) from anywhere
   - Allow Custom TCP (port 8000) from anywhere
8. Review and launch
9. Create or select an existing key pair, download it, and launch the instance

## Step 2: Connect to Your EC2 Instance

1. Open your terminal or SSH client
2. Connect to your instance:
   ```
   ssh -i /path/to/your-key-pair.pem ubuntu@your-ec2-public-dns
   ```

## Step 3: Upload Files to EC2

1. Create a local directory with all required files:
   - server.py
   - requirements.txt
   - ec2_setup.sh
   - model files (if you have them)

2. Upload files to your EC2 instance (from your local machine):
   ```
   # Create the directory on EC2
   ssh -i /path/to/your-key-pair.pem ubuntu@your-ec2-public-dns "mkdir -p ~/set-game-detector"
   
   # Upload server files
   scp -i /path/to/your-key-pair.pem server.py requirements.txt ec2_setup.sh ubuntu@your-ec2-public-dns:~/set-game-detector/
   
   # Make the setup script executable
   ssh -i /path/to/your-key-pair.pem ubuntu@your-ec2-public-dns "chmod +x ~/set-game-detector/ec2_setup.sh"
   ```

3. If you have model files, upload them to the correct directories:
   ```
   # Create the directories first
   ssh -i /path/to/your-key-pair.pem ubuntu@your-ec2-public-dns "mkdir -p ~/set-game-detector/models/Characteristics/11022025 ~/set-game-detector/models/Shape/15052024 ~/set-game-detector/models/Card/16042024"

   # Upload the models
   scp -i /path/to/your-key-pair.pem models/Characteristics/11022025/shape_model.keras ubuntu@your-ec2-public-dns:~/set-game-detector/models/Characteristics/11022025/
   scp -i /path/to/your-key-pair.pem models/Characteristics/11022025/fill_model.keras ubuntu@your-ec2-public-dns:~/set-game-detector/models/Characteristics/11022025/
   scp -i /path/to/your-key-pair.pem models/Shape/15052024/best.pt ubuntu@your-ec2-public-dns:~/set-game-detector/models/Shape/15052024/
   scp -i /path/to/your-key-pair.pem models/Card/16042024/best.pt ubuntu@your-ec2-public-dns:~/set-game-detector/models/Card/16042024/
   ```

## Step 4: Run the Setup Script

1. Run the setup script on the EC2 instance:
   ```
   ssh -i /path/to/your-key-pair.pem ubuntu@your-ec2-public-dns "cd ~/set-game-detector && ./ec2_setup.sh"
   ```

2. Once the script completes, verify that the service is running:
   ```
   ssh -i /path/to/your-key-pair.pem ubuntu@your-ec2-public-dns "sudo systemctl status set-detector"
   ```

## Step 5: Configure the Frontend

1. Get your EC2 instance's public DNS or IP address from the AWS console.

2. Update your frontend `.env` file with:
   ```
   REACT_APP_USE_MOCK_DATA=false
   REACT_APP_EC2_SERVER_URL=http://your-ec2-public-dns:8000/detect-sets
   ```

3. Rebuild and deploy your frontend:
   - If using AWS Amplify, commit and push the changes to your repository
   - Amplify will automatically rebuild and deploy

## Step 6: Test the Deployment

1. Open your frontend application
2. Upload an image of a SET game
3. The request should be sent to your EC2 instance, which will process it and return the results

## Troubleshooting

If you encounter issues:

1. Check the server logs:
   ```
   sudo journalctl -u set-detector -n 100
   ```

2. Make sure the server is running:
   ```
   sudo systemctl status set-detector
   ```

3. Restart the server if needed:
   ```
   sudo systemctl restart set-detector
   ```

4. Check for CORS issues in your browser's developer console

5. Verify your EC2 security group allows inbound traffic on port 8000

6. Test the API directly:
   ```
   curl -X GET http://localhost:8000
   ```

## Security Considerations

1. This setup is basic and meant for development/testing
2. For production:
   - Set up HTTPS using a domain name and Let's Encrypt
   - Restrict access to your EC2 instance
   - Consider setting up a proper load balancer

## Maintenance

1. To update the application:
   ```
   cd ~/set-game-detector
   # Upload new files if needed
   sudo systemctl restart set-detector
   ```

2. Monitor your EC2 instance performance in the AWS console

## Cost Management

Remember that EC2 instances incur costs as long as they're running, regardless of usage. Consider:

1. Using a smaller instance type for development
2. Stopping the instance when not in use
3. Setting up auto-scaling for production workloads
