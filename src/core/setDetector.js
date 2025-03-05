
/**
 * SET Game Detector Core Logic
 * 
 * This file contains the core logic for detecting SET combinations in an image.
 */

// Read environment variables properly
const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === 'true';

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

// EC2 backend implementation
const ec2DetectSets = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  
  try {
    // Get the EC2 server endpoint from environment variables
    const endpoint = process.env.REACT_APP_EC2_SERVER_URL;
    
    if (!endpoint || endpoint === "http://your-ec2-instance-public-dns:8000/detect-sets") {
      console.error("EC2 server URL not correctly configured in environment variables:", endpoint);
      throw new Error("EC2 server URL not correctly configured - still has placeholder value. Please update your .env file with the correct URL.");
    }
    
    console.log("Calling EC2 server:", endpoint);
    
    // First test if the server is reachable with a timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const healthResponse = await fetch(endpoint.replace('/detect-sets', '/health'), {
        signal: controller.signal
      }).catch(() => null);
      
      clearTimeout(timeoutId);
      
      if (!healthResponse || !healthResponse.ok) {
        console.warn("EC2 server health check failed, but will still try to process the request");
      }
    } catch (error) {
      console.warn("EC2 server health check failed, but will still try to process the request:", error.message);
    }
    
    // Set a longer timeout for the actual request
    const requestTimeout = 30000; // 30 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), requestTimeout);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      signal: controller.signal
      // No need to set Content-Type as it's automatically set with FormData
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API request failed with status ${response.status}:`, errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log("EC2 server response:", result);
    
    return result;
  } catch (error) {
    console.error("Error calling EC2 SET detection API:", error);
    
    // Provide more helpful error messages based on error type
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: "Request timed out. The EC2 server took too long to respond. Please check your server and try again."
      };
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return {
        success: false,
        error: "Network error: Could not connect to the EC2 server. Please check that your server is running and your EC2_SERVER_URL is correct."
      };
    }
    
    return {
      success: false,
      error: `Failed to connect to SET detection service: ${error.message}. Please check your EC2 server configuration.`
    };
  }
};

// Export the appropriate function based on configuration
export const detectSets = USE_MOCK_DATA ? mockDetectSets : ec2DetectSets;
