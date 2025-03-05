
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, Diamond, Circle, Triangle } from "lucide-react";
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
        "rounded-3xl border-2 border-dashed p-4 text-center", // Further reduced padding
        "ios-card bg-background/50 relative overflow-hidden",
        dragActive 
          ? "border-primary/60 bg-primary/10 scale-[1.02] shadow-lg" 
          : "border-border/50 scale-100 shadow-md",
        isProcessing ? "opacity-50 pointer-events-none" : "opacity-100"
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="set-card-pattern"></div>
      <div className="flex flex-col items-center justify-center gap-2 relative z-10">
        {/* Simplified icon row */}
        <div className="flex items-center justify-center space-x-3">
          <div className="h-6 w-6 sm:h-8 sm:w-8 set-diamond bg-set-purple/20 flex items-center justify-center rounded-lg shadow-sm">
            <Diamond className="h-3 w-3 sm:h-4 sm:w-4 text-set-purple" />
          </div>
          <div className="h-6 w-6 sm:h-8 sm:w-8 set-oval bg-set-red/20 flex items-center justify-center rounded-lg shadow-sm">
            <Circle className="h-3 w-3 sm:h-4 sm:w-4 text-set-red" />
          </div>
          <div className="h-6 w-6 sm:h-8 sm:w-8 bg-set-green/20 flex items-center justify-center rounded-lg shadow-sm">
            <Triangle className="h-3 w-3 sm:h-4 sm:w-4 text-set-green" />
          </div>
        </div>
        
        {/* Streamlined upload arrow */}
        <div className="rounded-full bg-primary/10 p-3 shadow-sm pulse-soft mt-1">
          <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        </div>
        
        {/* More compact text section */}
        <div className="space-y-1 my-2">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold">
            Upload your SET game image
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto">
            Drag and drop your image here, or tap to browse
          </p>
        </div>
        
        {/* Button moved up in the layout */}
        <Button
          onClick={handleButtonClick}
          className="ios-btn set-btn-purple font-medium px-4 py-1.5 h-auto text-sm sm:text-base"
          disabled={isProcessing}
        >
          Select Image
        </Button>
        
        {/* File info as a subtle note */}
        <p className="text-xs text-muted-foreground mt-2">
          Supports PNG, JPG, JPEG (max 10MB)
        </p>
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
