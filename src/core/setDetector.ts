
/**
 * SET Card Detection Module
 * 
 * This is the core module responsible for image analysis and SET card detection.
 * It handles communication with the backend AI service (when in production mode)
 * or provides mock responses (when in development mode).
 * 
 * Configuration:
 * - VITE_USE_MOCK_DATA: Set to 'true' to use mock data (no backend needed)
 * - VITE_BACKEND_URL: URL of the backend API (required in production mode)
 */

// Configuration from environment variables
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '/api/detect-sets';

interface DetectionResult {
  success: boolean;
  setCount?: number;
  image?: string;
  error?: string;
}

/**
 * Mock implementation that returns simulated results
 * Used for development/testing without a backend
 * 
 * @param {File} imageFile - The uploaded image file
 * @returns {Promise<DetectionResult>} - Mock detection results
 */
const mockDetectSets = async (imageFile: File): Promise<DetectionResult> => {
  console.log("Using mock SET detection for image:", imageFile.name);
  
  // Simulate processing time (1-2 seconds)
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  
  // Return mock results with a random number of sets (1-6)
  return {
    success: true,
    setCount: Math.floor(Math.random() * 6) + 1,
    image: URL.createObjectURL(imageFile)
  };
};

/**
 * Production implementation that calls the backend AI service
 * 
 * @param {File} imageFile - The uploaded image file
 * @returns {Promise<DetectionResult>} - Detection results from the backend
 */
const backendDetectSets = async (imageFile: File): Promise<DetectionResult> => {
  if (!BACKEND_URL) {
    throw new Error("Backend URL not configured. Please set VITE_BACKEND_URL in your .env file.");
  }
  
  console.log("Calling SET detection API:", BACKEND_URL);
  
  // Prepare form data with the image file
  const formData = new FormData();
  formData.append('file', imageFile);
  
  try {
    // Set a 30-second timeout for the API call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    // Make the API request
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Handle error responses
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error (${response.status}): ${errorText}`);
    }
    
    // Parse and return the results
    return await response.json();
  } catch (error) {
    console.error("API error:", error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error("Request timed out. The server took too long to respond.");
      }
      
      throw error;
    }
    
    throw new Error("An unknown error occurred");
  }
};

// Export the appropriate implementation based on configuration
export const detectSets = USE_MOCK_DATA ? mockDetectSets : backendDetectSets;
