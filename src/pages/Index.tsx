
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
    <div className="min-h-screen flex flex-col bg-set-gradient">
      <Header />
      
      <main className="flex-1 flex flex-col pt-16 pb-4 sm:pt-20 sm:pb-6">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 flex flex-col items-center">
          {/* Title section - Optimized spacing for both mobile and desktop */}
          <div className="text-center mb-4 sm:mb-6 animate-fade-in w-full max-w-3xl">
            <div className="inline-flex items-center justify-center gap-2 bg-background/40 backdrop-blur-md rounded-full px-3 py-1 mb-2 border border-border/20 shadow-sm">
              <Diamond className="h-3.5 w-3.5 text-set-purple" />
              <Circle className="h-3.5 w-3.5 text-set-red" />
              <Triangle className="h-3.5 w-3.5 text-set-green" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-2 leading-tight">
              SET Game Detector
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Upload an image of your SET card game layout and we'll identify all valid sets for you.
            </p>
            
            {isMockMode && (
              <div className="mt-2 p-1.5 bg-yellow-100 text-yellow-800 rounded-lg max-w-xs mx-auto text-[10px] sm:text-xs">
                ⚠️ Running in mock mode. Set REACT_APP_USE_MOCK_DATA=false to use the real backend.
              </div>
            )}
          </div>

          {/* Main content area - Reduced vertical spacing */}
          <div className="w-full mb-6">
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

          {/* How It Works section - Moved closer to the main content */}
          <div className={cn(
            "w-full animate-fade-in mt-6 sm:mt-10 pt-2",
            "before:content-[''] before:block before:h-px before:w-16 before:bg-border/40 before:mx-auto before:mb-4 sm:before:mb-6"
          )}>
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-5 text-center">
              How It Works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {[
                {
                  title: "Upload Image",
                  description: "Take a photo of your SET game layout and upload it.",
                  icon: "diamond"
                },
                {
                  title: "AI Detection",
                  description: "Our AI analyzes the image to identify all cards and their attributes.",
                  icon: "circle"
                },
                {
                  title: "View Results",
                  description: "See all valid sets highlighted directly on your image.",
                  icon: "triangle"
                }
              ].map((step, index) => (
                <div key={index} className="rounded-xl ios-card hover-lift p-3 sm:p-4 relative overflow-hidden">
                  <div className="set-card-pattern opacity-20"></div>
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div className={cn(
                      "w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg shadow-sm mb-2",
                      step.icon === "diamond" ? "bg-set-purple/10 set-diamond" : 
                      step.icon === "circle" ? "bg-set-red/10 set-oval" : 
                      "bg-set-green/10"
                    )}>
                      {step.icon === "diamond" ? (
                        <Diamond className="h-3 w-3 sm:h-4 sm:w-4 text-set-purple opacity-80" />
                      ) : step.icon === "circle" ? (
                        <Circle className="h-3 w-3 sm:h-4 sm:w-4 text-set-red opacity-80" />
                      ) : (
                        <Triangle className="h-3 w-3 sm:h-4 sm:w-4 text-set-green opacity-80" />
                      )}
                    </div>
                    <h3 className="text-sm font-medium mb-1">
                      {step.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
