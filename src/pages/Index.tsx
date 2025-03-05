
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import ImageUploader from "@/components/ImageUploader";
import Results from "@/components/Results";
import Footer from "@/components/Footer";
import { Diamond, Circle, Triangle } from "lucide-react";
import { toast } from "sonner";
import { detectSets } from "@/core/setDetector";
import { cn } from "@/lib/utils";

const Index: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [foundSets, setFoundSets] = useState(0);
  const [isMockMode, setIsMockMode] = useState(false);

  useEffect(() => {
    setIsMockMode(process.env.REACT_APP_USE_MOCK_DATA === 'true');
    console.log("Mock mode:", process.env.REACT_APP_USE_MOCK_DATA);
    console.log("API endpoint:", process.env.REACT_APP_AWS_API_ENDPOINT);
  }, []);

  const handleImageSelected = async (image: File) => {
    setSelectedImage(image);
    setImageUrl(URL.createObjectURL(image));
    setProcessedImageUrl(null);
    setIsProcessing(true);

    try {
      const result = await detectSets(image);
      
      if (result.success) {
        setFoundSets(result.setCount);
        
        if (result.image && !isMockMode) {
          setProcessedImageUrl(result.image);
        }
        
        toast.success(`Found ${result.setCount} ${result.setCount === 1 ? 'set' : 'sets'} in the image!`);
      } else {
        toast.error(result.error || "Failed to process image");
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    if (processedImageUrl && processedImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(processedImageUrl);
    }
    setSelectedImage(null);
    setImageUrl(null);
    setProcessedImageUrl(null);
    setFoundSets(0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-blue-50">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-20 pb-10">
        <div className="max-w-4xl w-full flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Diamond className="h-5 w-5 text-set-purple" />
            <Circle className="h-5 w-5 text-set-red" />
            <Triangle className="h-5 w-5 text-set-green" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-3 tracking-tight">
            SET Game Detector
          </h1>
          
          <p className="text-center text-gray-600 max-w-lg mb-8">
            Upload an image of your SET card game layout and we'll identify all valid sets for you using AI.
          </p>
          
          {isMockMode && (
            <div className="mb-6 p-2 bg-yellow-100 text-yellow-800 rounded-lg max-w-sm text-xs text-center">
              ⚠️ Running in mock mode. Set REACT_APP_USE_MOCK_DATA=false to use the real backend.
            </div>
          )}

          <div className="w-full max-w-xl bg-white bg-opacity-40 backdrop-blur-md rounded-xl shadow-lg p-6 mb-10">
            <div className="relative z-10">
              {!imageUrl ? (
                <ImageUploader 
                  onImageSelected={handleImageSelected} 
                  isProcessing={isProcessing}
                />
              ) : (
                <Results 
                  imageUrl={imageUrl}
                  processedImageUrl={processedImageUrl}
                  isProcessing={isProcessing}
                  onReset={handleReset}
                  foundSets={foundSets}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
