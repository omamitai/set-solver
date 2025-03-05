
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import ImageUploader from "@/components/ImageUploader";
import Results from "@/components/Results";
import Footer from "@/components/Footer";
import { Diamond, Circle, Triangle } from "lucide-react";
import { toast } from "sonner";
import { detectSets } from "@/core/setDetector";

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

  const SetIcon = ({ type }: { type: 'diamond' | 'circle' | 'triangle' }) => {
    const IconComponent = type === 'diamond' ? Diamond : type === 'circle' ? Circle : Triangle;
    const bgColor = type === 'diamond' ? 'bg-set-purple/10' : type === 'circle' ? 'bg-set-red/10' : 'bg-set-green/10';
    const textColor = type === 'diamond' ? 'text-set-purple' : type === 'circle' ? 'text-set-red' : 'text-set-green';
    const shapeClass = type === 'diamond' ? 'set-diamond' : type === 'circle' ? 'set-oval' : '';
    
    return (
      <div className={`w-10 h-10 sm:w-12 sm:h-12 ${bgColor} ${shapeClass} flex items-center justify-center rounded-xl shadow-sm`}>
        <IconComponent className={`h-5 w-5 sm:h-6 sm:w-6 ${textColor} opacity-80`} />
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-set-gradient">
      <Header />
      
      {/* Reduced top padding to fit everything on screen without scrolling */}
      <main className="flex-1 pt-12 sm:pt-16 section-padding">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-4 sm:mb-6 animate-fade-in px-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Diamond className="h-5 w-5 text-set-purple opacity-80" />
              <Circle className="h-5 w-5 text-set-red opacity-80" />
              <Triangle className="h-5 w-5 text-set-green opacity-80" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2 sm:mb-3 leading-tight">
              SET Game Detector
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
              Upload an image of your SET card game layout and we'll identify all valid sets for you.
            </p>
            
            {isMockMode && (
              <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded-lg max-w-xl mx-auto text-xs sm:text-sm">
                ⚠️ Running in mock mode. Set REACT_APP_USE_MOCK_DATA=false in your .env file to use the real AWS backend.
              </div>
            )}
          </div>

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

          {/* Only show How It Works section when there's room (no image processing happening) */}
          {!imageUrl && (
            <div className="mt-8 sm:mt-10 animate-fade-in px-4">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center">
                How It Works
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
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
                  <div key={index} className="rounded-2xl ios-card hover-lift p-4 sm:p-6 relative overflow-hidden">
                    <div className="set-card-pattern"></div>
                    <div className="flex flex-col items-center text-center relative z-10">
                      <SetIcon type={step.icon as 'diamond' | 'circle' | 'triangle'} />
                      <h3 className="text-base sm:text-lg font-medium mt-3 mb-1 sm:mb-2">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground text-xs sm:text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
