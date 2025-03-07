
/**
 * SET Game Detector Core Logic
 * 
 * Handles communication with the backend service or provides mock data.
 */

// Read environment variables
const USE_MOCK_DATA = process.env.REACT_APP_USE_MOCK_DATA === 'true';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Mock implementation for development/testing
 */
const mockDetectSets = async (imageFile) => {
  console.log("Using mock SET detection for:", imageFile.name);
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mock results
  const mockNumSets = Math.floor(Math.random() * 6) + 1;
  
  return {
    success: true,
    setCount: mockNumSets,
    image: URL.createObjectURL(imageFile)
  };
};

/**
 * Production implementation using backend server
 */
const backendDetectSets = async (imageFile) => {
  if (!BACKEND_URL) {
    throw new Error("Backend URL not configured. Please set REACT_APP_BACKEND_URL in your .env file.");
  }
  
  console.log("Calling backend API:", BACKEND_URL);
  
  const formData = new FormData();
  formData.append('file', imageFile);
  
  try {
    // Set a reasonable timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server responded with status ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error calling SET detection API:", error);
    
    if (error.name === 'AbortError') {
      throw new Error("Request timed out. The server took too long to respond.");
    }
    
    throw error;
  }
};

// Export the appropriate function based on configuration
export const detectSets = USE_MOCK_DATA ? mockDetectSets : backendDetectSets;
