
# Getting Started with SET Game Detector

This guide will help you set up and run the SET Game Detector project locally, and prepare it for deployment.

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- Python 3.8+ (for backend functionality)

## Setup Instructions

### 1. Create package-lock.json

Before you can run this project in Lovable, you need to create a package-lock.json file:

```bash
# Run this command in the project root directory
npm install
```

This will generate the package-lock.json file required by Lovable.

### 2. Configure Environment Variables

The project uses environment variables for configuration. Check the `.env` file and modify as needed:

- `VITE_USE_MOCK_DATA`: Set to `true` for development without a backend, `false` for production
- `VITE_BACKEND_URL`: The URL of your backend API

### 3. Development Mode

To run the project in development mode:

```bash
npm run dev
```

The application will be available at http://localhost:8080.

### 4. Production Build

To create a production build:

```bash
npm run build
```

This will generate optimized assets in the `dist` directory.

### 5. EC2 Deployment

To deploy to Amazon EC2:

```bash
./deploy.sh your-ec2-ip
```

Replace `your-ec2-ip` with your EC2 instance's public IP address.

## Project Structure

- `src/`: Frontend source code (React)
  - `components/`: UI components
  - `core/`: Core functionality
  - `pages/`: Page components
- `server.py`: Python backend server
- `setup.sh`: EC2 setup script
- `deploy.sh`: Deployment script

## Feature Configuration

- **Mock Mode**: For development without a backend, set `VITE_USE_MOCK_DATA=true` in `.env`
- **Production Mode**: Configure your backend URL with `VITE_BACKEND_URL=http://your-backend-url`

## Troubleshooting

If you encounter issues:

1. Check console logs for errors
2. Verify environment variables are correctly set
3. Ensure your backend server is running (if not using mock data)
4. Confirm port 8080 is available for the development server
