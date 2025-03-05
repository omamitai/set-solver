
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import ImageUploader from "@/components/ImageUploader";
import Results from "@/components/Results";
import Footer from "@/components/Footer";
import { Diamond, Circle, Triangle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { detectSets } from "@/core/setDetector";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";

const Index: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [foundSets, setFoundSets] = useState(0);
  const [isMockMode, setIsMockMode] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    <div className={cn(
      "min-h-screen flex flex-col",
      isDark ? "bg-gradient-to-br from-background to-background/80" : "bg-set-gradient"
    )}>
      <Header />
      
      <main className="flex-1 flex flex-col pt-16 sm:pt-20 pb-6">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 flex flex-col items-center">
          {/* Title section */}
          <div className="text-center mb-6 sm:mb-8 animate-fade-in w-full max-w-2xl">
            <div className="inline-flex items-center justify-center gap-2 bg-background/40 backdrop-blur-md rounded-full px-3 py-1 mb-3 sm:mb-4 border border-border/20 shadow-sm">
              <Diamond className="h-3.5 w-3.5 text-set-purple animate-pulse" />
              <Circle className="h-3.5 w-3.5 text-set-red" />
              <Triangle className="h-3.5 w-3.5 text-set-green" />
              <Sparkles className="h-3 w-3 text-yellow-500 animate-pulse" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 sm:mb-4 leading-tight">
              SET Game Detector
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              Upload an image of your SET card game layout and we'll identify all valid sets for you.
            </p>
            
            {isMockMode && (
              <div className="mt-2 p-1.5 bg-yellow-100 text-yellow-800 rounded-lg max-w-xs mx-auto text-[10px] sm:text-xs">
                ⚠️ Running in mock mode. Set REACT_APP_USE_MOCK_DATA=false to use the real backend.
              </div>
            )}
          </div>

          {/* Main content area */}
          <div className="w-full mb-8 transition-all duration-500">
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
      </main>

      <Footer />
    </div>
  );
};

export default Index;
