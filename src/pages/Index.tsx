
import React, { useState } from "react";
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [foundSets, setFoundSets] = useState(0);

  const handleImageSelected = async (image: File) => {
    setSelectedImage(image);
    setImageUrl(URL.createObjectURL(image));
    setIsProcessing(true);

    try {
      // Call our SET detection logic
      const result = await detectSets(image);
      
      if (result.success) {
        setFoundSets(result.setCount);
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
    setSelectedImage(null);
    setImageUrl(null);
    setFoundSets(0);
  };

  const SetIcon = ({ type }: { type: 'diamond' | 'circle' | 'triangle' }) => {
    const IconComponent = type === 'diamond' ? Diamond : type === 'circle' ? Circle : Triangle;
    const bgColor = type === 'diamond' ? 'bg-set-purple/10' : type === 'circle' ? 'bg-set-red/10' : 'bg-set-green/10';
    const textColor = type === 'diamond' ? 'text-set-purple' : type === 'circle' ? 'text-set-red' : 'text-set-green';
    const shapeClass = type === 'diamond' ? 'set-diamond' : type === 'circle' ? 'set-oval' : '';
    
    return (
      <div className={`w-12 h-12 sm:w-14 sm:h-14 ${bgColor} ${shapeClass} flex items-center justify-center rounded-xl shadow-sm`}>
        <IconComponent className={`h-6 w-6 sm:h-7 sm:w-7 ${textColor} opacity-80`} />
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-set-gradient">
      <Header />
      
      <main className="flex-1 pt-20 sm:pt-24 md:pt-28 section-padding">
        <div className="max-w-4xl mx-auto">
          {/* Main content with sufficient padding to avoid overlap with fixed header */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16 animate-fade-in px-4 pt-6 sm:pt-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Diamond className="h-6 w-6 text-set-purple opacity-80" />
              <Circle className="h-6 w-6 text-set-red opacity-80" />
              <Triangle className="h-6 w-6 text-set-green opacity-80" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 sm:mb-6 leading-tight">
              SET Game Detector
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload an image of your SET card game layout and we'll identify all valid sets for you.
            </p>
          </div>

          {!imageUrl ? (
            <ImageUploader 
              onImageSelected={handleImageSelected} 
              isProcessing={isProcessing}
            />
          ) : (
            <Results 
              imageUrl={imageUrl}
              isProcessing={isProcessing}
              onReset={handleReset}
              foundSets={foundSets}
            />
          )}

          <div className="mt-14 sm:mt-20 animate-fade-in px-4">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8 text-center">
              How It Works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-7">
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
                <div key={index} className="rounded-2xl ios-card hover-lift p-6 sm:p-8 relative overflow-hidden">
                  <div className="set-card-pattern"></div>
                  <div className="flex flex-col items-center text-center relative z-10">
                    <SetIcon type={step.icon as 'diamond' | 'circle' | 'triangle'} />
                    <h3 className="text-lg sm:text-xl font-medium mt-4 mb-2 sm:mb-3">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
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
