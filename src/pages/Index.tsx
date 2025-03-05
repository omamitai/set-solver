
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
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 section-padding">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Set Game Detector
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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

          <div className="mt-16 animate-fade-in">
            <h2 className="text-2xl font-semibold mb-6 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <div key={index} className="glass glass-dark rounded-xl p-6 hover-lift">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-primary font-medium">{index + 1}</span>
                  </div>
                  <h3 className="text-lg font-medium mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
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
