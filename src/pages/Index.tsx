
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
  const [apiEndpoint, setApiEndpoint] = useState<string | null>(null);

  useEffect(() => {
    // Determine if we're in mock mode
    const useMockData = process.env.REACT_APP_USE_MOCK_DATA === 'true';
    setIsMockMode(useMockData);
    
    // Get the API endpoint (either EC2 or AWS API Gateway)
    const endpoint = process.env.REACT_APP_AWS_API_ENDPOINT || process.env.REACT_APP_EC2_SERVER_URL;
    setApiEndpoint(endpoint);
    
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Mock mode:", useMockData);
    console.log("API endpoint:", endpoint);
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
          <div className="text-center mb-6 sm:mb-8 animate-fade-in w-full max-w-3xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2 leading-tight">
              SET Game Detector
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
              Upload an image of your SET card game layout and we'll identify all valid sets for you.
            </p>
            
            {isMockMode && (
              <div className="mt-2 p-1.5 bg-yellow-100 text-yellow-800 rounded-lg max-w-xs mx-auto text-[10px] sm:text-xs">
                ⚠️ Running in mock mode. Set REACT_APP_USE_MOCK_DATA=false to use the real backend.
              </div>
            )}
            
            {!isMockMode && !apiEndpoint && (
              <div className="mt-2 p-1.5 bg-red-100 text-red-800 rounded-lg max-w-xs mx-auto text-[10px] sm:text-xs">
                ⚠️ Backend API endpoint not configured. Check your environment variables.
              </div>
            )}
          </div>

          <div className="w-full">
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

          <div className={cn(
            "w-full animate-fade-in mt-10 sm:mt-20 pt-2",
            "before:content-[''] before:block before:h-px before:w-16 before:bg-border/40 before:mx-auto before:mb-4 sm:before:mb-6"
          )}>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-5 text-center">
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
