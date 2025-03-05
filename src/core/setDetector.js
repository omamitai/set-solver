
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
      throw new Error("EC2 server URL not correctly configured - still has placeholder value");
    }
    
    console.log("Calling EC2 server:", endpoint);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      // No need to set Content-Type as it's automatically set with FormData
    });
    
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
    return {
      success: false,
      error: `Failed to connect to SET detection service: ${error.message}. Please check your EC2 server configuration.`
    };
  }
};

// Export the appropriate function based on configuration
export const detectSets = USE_MOCK_DATA ? mockDetectSets : ec2DetectSets;
