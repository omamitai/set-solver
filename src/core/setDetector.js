
/**
 * SET Game Detector Core Logic
 * 
 * This file contains the core logic for detecting SET combinations in an image.
 */

// Read environment variables properly
const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === 'true';
const API_ENDPOINT = process.env.REACT_APP_AWS_API_ENDPOINT || process.env.REACT_APP_EC2_SERVER_URL;

// Frontend-only mock implementation (for development)
const mockDetectSets = async (imageFile) => {
  try {
    console.log("Detecting SETs in image (MOCK):", imageFile.name);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return mock results
    const mockNumSets = Math.floor(Math.random() * 6) + 1;
    
    return {
      success: true,
      setCount: mockNumSets,
      image: URL.createObjectURL(imageFile) // Just return the original image in mock mode
    };
  } catch (error) {
    console.error("Error in mock SET detection:", error);
    return {
      success: false,
      error: "Failed to process image"
    };
  }
};

// Backend implementation (EC2 or AWS Lambda)
const backendDetectSets = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  
  try {
    if (!API_ENDPOINT) {
      console.error("Backend API endpoint not configured in environment variables");
      throw new Error("Backend server URL not configured. Please update your .env file with either REACT_APP_EC2_SERVER_URL or REACT_APP_AWS_API_ENDPOINT.");
    }
    
    console.log("Calling backend API:", API_ENDPOINT);
    
    // Set a timeout for the request
    const requestTimeout = 30000; // 30 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), requestTimeout);
    
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API request failed with status ${response.status}:`, errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log("Backend response:", result);
    
    return result;
  } catch (error) {
    console.error("Error calling SET detection API:", error);
    
    // Provide more helpful error messages based on error type
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: "Request timed out. The backend server took too long to respond. Please check your server and try again."
      };
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return {
        success: false,
        error: "Network error: Could not connect to the backend server. Please check that your server is running and your API endpoint is correct."
      };
    }
    
    return {
      success: false,
      error: `Failed to connect to SET detection service: ${error.message}. Please check your backend configuration.`
    };
  }
};

// Export the appropriate function based on configuration
export const detectSets = USE_MOCK_DATA ? mockDetectSets : backendDetectSets;
