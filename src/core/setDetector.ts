
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
    properties: Array<{
      name: string;
      values: string[];
    }>;
  }>;
}

/**
 * Detects SET combinations in the uploaded image
 * 
 * @param image - The image file containing SET cards
 * @returns Promise with detection results
 */
export const detectSets = async (image: File): Promise<SetDetectionResponse> => {
  // Check if we're using mock data (for development)
  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  console.log('Using mock data:', useMockData);
  
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
    console.log('Calling backend API for SET detection');
    // Get the backend URL from environment variables
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '/api/detect-sets';
    
    // Prepare form data for file upload
    const formData = new FormData();
    formData.append('image', image);
    
    // Make the API call
    const response = await fetch(backendUrl, {
      method: 'POST',
      body: formData,
    });
    
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
    
    return {
      success: true,
      setCount: data.sets?.length || 0,
      image: data.processed_image || null,
      sets: data.sets || []
    };
  } catch (error) {
    // Handle network or parsing errors
    console.error('Error calling SET detection API:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      setCount: 0
    };
  }
};
