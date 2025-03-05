
import React, { useState } from "react";
import Header from "@/components/Header";
import ImageUploader from "@/components/ImageUploader";
import Results from "@/components/Results";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const Index: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [foundSets, setFoundSets] = useState(0);

  const handleImageSelected = async (image: File) => {
    setSelectedImage(image);
    setImageUrl(URL.createObjectURL(image));
    setIsProcessing(true);

    // Simulate processing
    setTimeout(() => {
      // In a real implementation, this would call the API with the image
      // and get back the results
      setIsProcessing(false);
      
      // Simulate finding random number of sets (1-6)
      const randomSets = Math.floor(Math.random() * 6) + 1;
      setFoundSets(randomSets);
      
      toast.success(`Found ${randomSets} sets in the image!`);
    }, 3000);
  };

  const handleReset = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setSelectedImage(null);
    setImageUrl(null);
    setFoundSets(0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-set-gradient">
      <Header />
      
      <main className="flex-1 pt-20 sm:pt-24 md:pt-28 section-padding">
        <div className="max-w-4xl mx-auto">
          {/* Main content with sufficient padding to avoid overlap with fixed header */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16 animate-fade-in px-4 pt-6 sm:pt-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 sm:mb-6 ios-text-gradient leading-tight">
              Set Game Detector
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload an image of your Set card game layout and we'll identify all valid sets for you.
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
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8 text-center ios-text-gradient">
              How It Works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-7">
              {[
                {
                  title: "Upload Image",
                  description: "Take a photo of your Set game layout and upload it."
                },
                {
                  title: "AI Detection",
                  description: "Our AI analyzes the image to identify all cards and their attributes."
                },
                {
                  title: "View Results",
                  description: "See all valid sets highlighted directly on your image."
                }
              ].map((step, index) => (
                <div key={index} className="rounded-3xl bg-background/50 backdrop-blur-sm p-6 sm:p-8 hover-lift shadow-md border border-border/10 ios-shadow">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 sm:mb-5">
                    <span className="text-primary font-semibold text-base sm:text-lg">{index + 1}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-medium mb-2 sm:mb-3 ios-text-gradient">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {step.description}
                  </p>
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
