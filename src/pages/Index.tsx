
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import ImageUploader from "@/components/ImageUploader";
import Results from "@/components/Results";
import Footer from "@/components/Footer";
import { Diamond, Circle, Triangle, ChevronDown } from "lucide-react";
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

  const scrollToHow = () => {
    const howSection = document.getElementById('how-it-works');
    if (howSection) {
      howSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-set-gradient">
      <Header />
      
      <main className="flex-1 flex flex-col pt-20 sm:pt-24 pb-6 sm:pb-10">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 flex flex-col items-center">
          {/* Title section with improved styling */}
          <div className="text-center mb-6 sm:mb-10 animate-fade-in w-full max-w-3xl pt-4 sm:pt-6">
            <div className="inline-flex items-center justify-center gap-2 bg-background/50 backdrop-blur-md rounded-full px-3 py-1 mb-3 sm:mb-4 border border-border/30 shadow-sm">
              <Diamond className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-set-purple" />
              <Circle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-set-red" />
              <Triangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-set-green" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 sm:mb-4 leading-tight">
              SET Game Detector
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-4">
              Upload an image of your SET card game layout and we'll identify all valid sets for you using AI.
            </p>
            
            {isMockMode && (
              <div className="mt-2 mb-4 p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg max-w-sm mx-auto text-[11px] sm:text-xs">
                ⚠️ Running in mock mode. Set REACT_APP_USE_MOCK_DATA=false to use the real backend.
              </div>
            )}
            
            <div className="hidden sm:block">
              <button
                onClick={scrollToHow}
                className="mt-3 flex flex-col items-center gap-1 text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors mx-auto"
                aria-label="Learn how it works"
              >
                <span>Learn how it works</span>
                <ChevronDown className="h-4 w-4 animate-bounce" />
              </button>
            </div>
          </div>

          {/* Main content area */}
          <div className="w-full mb-14 sm:mb-16 bg-background/30 backdrop-blur-sm rounded-2xl border border-border/30 shadow-md p-5 sm:p-8 relative overflow-hidden">
            <div className="set-card-pattern opacity-10"></div>
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

          {/* How It Works section */}
          <div 
            id="how-it-works"
            className={cn(
              "w-full animate-fade-in mt-12 sm:mt-20 pt-4",
              "before:content-[''] before:block before:h-px before:w-16 before:bg-border/40 before:mx-auto before:mb-6 sm:before:mb-8"
            )}
          >
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-6 sm:mb-8 text-center">
              How It Works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {[
                {
                  title: "Upload Image",
                  description: "Take a photo of your SET game layout and upload it to our secure server.",
                  icon: "diamond"
                },
                {
                  title: "AI Detection",
                  description: "Our computer vision AI analyzes the image to identify all cards and their attributes.",
                  icon: "circle"
                },
                {
                  title: "View Results",
                  description: "See all valid sets highlighted directly on your image with detailed explanations.",
                  icon: "triangle"
                }
              ].map((step, index) => (
                <div key={index} className="rounded-xl ios-card hover-lift p-4 sm:p-6 relative overflow-hidden">
                  <div className="set-card-pattern opacity-20"></div>
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg shadow-sm mb-3 sm:mb-4",
                      step.icon === "diamond" ? "bg-set-purple/15 set-diamond" : 
                      step.icon === "circle" ? "bg-set-red/15 set-oval" : 
                      "bg-set-green/15"
                    )}>
                      {step.icon === "diamond" ? (
                        <Diamond className="h-4 w-4 sm:h-5 sm:w-5 text-set-purple opacity-80" />
                      ) : step.icon === "circle" ? (
                        <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-set-red opacity-80" />
                      ) : (
                        <Triangle className="h-4 w-4 sm:h-5 sm:w-5 text-set-green opacity-80" />
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
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
