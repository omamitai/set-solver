
/**
 * SET Game Detector Core Logic
 * 
 * This module handles the communication with the backend API for SET card detection.
 * In mock mode, it returns simulated results for testing and development.
 */

// Define response type for better type safety
interface SetDetectionResponse {
  success: boolean;
  error?: string;
  setCount: number;
  image?: string;
  sets?: Array<{
    cards: number[];
    properties?: Array<{
      name: string;
      values: string[];
    }>;
  }>;
}

/**
 * Logs environment configuration for debugging
 */
const logEnvironmentConfig = () => {
  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '/api/detect-sets';
  console.log('Environment config:', {
    useMockData,
    backendUrl,
    nodeEnv: import.meta.env.MODE || 'unknown'
  });
};

/**
 * Detects SET combinations in the uploaded image
 * 
 * @param image - The image file containing SET cards
 * @returns Promise with detection results
 */
export const detectSets = async (image: File): Promise<SetDetectionResponse> => {
  // Check if we're using mock data (for development)
  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '/api/detect-sets';
  
  logEnvironmentConfig();
  console.log(`Detecting sets in "${image.name}" (size: ${(image.size / 1024).toFixed(2)} KB, type: ${image.type})`);
  console.log(`Mode: ${useMockData ? 'MOCK' : 'PRODUCTION'}`);
  
  if (useMockData) {
    console.log('Using mock data for SET detection');
    // Simulate API call with mock data
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        // Random number of sets between 1-5
        const setCount = Math.floor(Math.random() * 5) + 1;
        
        resolve({
          success: true,
          setCount,
          sets: Array(setCount).fill(0).map((_, i) => ({
            cards: [i*3, i*3+1, i*3+2],
            properties: [
              { name: 'color', values: ['red', 'green', 'purple'] },
              { name: 'shape', values: ['oval', 'diamond', 'squiggle'] },
              { name: 'number', values: ['one', 'two', 'three'] },
              { name: 'shading', values: ['solid', 'striped', 'open'] }
            ]
          }))
        });
      }, 1500);
    });
  }
  
  // Using real backend
  try {
    console.log('Calling backend API for SET detection:', backendUrl);
    
    if (!backendUrl) {
      throw new Error('Backend URL is not configured. Please check your .env file.');
    }
    
    // Prepare form data for file upload
    const formData = new FormData();
    formData.append('image', image);
    
    // Add timeout to API call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout
    
    // Make the API call
    const response = await fetch(backendUrl, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    
    // Clear the timeout
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      // Handle HTTP error responses
      const errorText = await response.text();
      console.error('API error:', response.status, errorText);
      return {
        success: false,
        error: `Server error: ${response.status} ${response.statusText}`,
        setCount: 0
      };
    }
    
    // Parse the response
    const data = await response.json();
    console.log('API response:', data);
    
    if (!data.success) {
      return {
        success: false,
        error: data.error || 'Unknown server error',
        setCount: 0
      };
    }
    
    return {
      success: true,
      setCount: data.sets?.length || 0,
      image: data.image || null,
      sets: data.sets || []
    };
  } catch (error) {
    // Handle network or parsing errors
    console.error('Error calling SET detection API:', error);
    
    // Special handling for timeout errors
    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timed out. The server took too long to respond.',
        setCount: 0
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      setCount: 0
    };
  }
};
