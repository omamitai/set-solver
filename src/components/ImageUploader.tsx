
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageUploaderProps {
  onImageSelected: (image: File) => void;
  isProcessing: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndProcessFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndProcessFile(file);
    }
  };

  const validateAndProcessFile = (file: File) => {
    if (!file.type.match('image.*')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 10MB');
      return;
    }

    onImageSelected(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className={cn(
        "w-full max-w-xl mx-auto animate-scale-in transition-all duration-300",
        "rounded-3xl border-2 border-dashed p-6 sm:p-10 text-center",
        "bg-background/50 backdrop-blur-sm ios-shadow",
        dragActive 
          ? "border-primary/70 bg-primary/5 scale-[1.02]" 
          : "border-border/50 scale-100",
        isProcessing ? "opacity-50 pointer-events-none" : "opacity-100"
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center gap-4 sm:gap-6">
        <div className="rounded-full bg-primary/10 p-4 ios-shadow">
          <ArrowUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
        </div>
        <div className="space-y-2 sm:space-y-3">
          <h3 className="text-base sm:text-xl md:text-2xl font-medium ios-text-gradient">
            Upload your Set game image
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto">
            Drag and drop your image here, or tap to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Supports PNG, JPG, JPEG (max 10MB)
          </p>
        </div>
        <Button
          onClick={handleButtonClick}
          className="mt-2 sm:mt-3 rounded-full px-6 py-2 h-auto bg-primary hover:bg-primary/90 transition-all duration-300 font-medium"
          disabled={isProcessing}
        >
          Select Image
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleChange}
        disabled={isProcessing}
      />
    </div>
  );
};

export default ImageUploader;
