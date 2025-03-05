
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

// AWS backend implementation
const awsDetectSets = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  try {
    // Get the AWS API Gateway endpoint from environment variables
    const endpoint = process.env.REACT_APP_AWS_API_ENDPOINT;
    
    if (!endpoint) {
      console.error("AWS API endpoint not configured in environment variables");
      throw new Error("API endpoint not configured");
    }
    
    console.log("Calling AWS endpoint:", endpoint);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const result = await response.json();
    console.log("AWS API response:", result);
    
    return result;
  } catch (error) {
    console.error("Error calling AWS SET detection API:", error);
    return {
      success: false,
      error: "Failed to connect to SET detection service. Please try again."
    };
  }
};

// Export the appropriate function based on configuration
export const detectSets = USE_MOCK_DATA ? mockDetectSets : awsDetectSets;
