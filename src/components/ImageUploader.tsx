
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
        "rounded-3xl border-2 border-dashed p-6 sm:p-10 text-center",
        "ios-card bg-background/30 relative overflow-hidden",
        dragActive 
          ? "border-primary/50 bg-primary/5 scale-[1.01]" 
          : "border-border/40 scale-100",
        isProcessing ? "opacity-50 pointer-events-none" : "opacity-100"
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="set-card-pattern"></div>
      <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 relative z-10">
        <div className="flex items-center justify-center space-x-3">
          <div className="h-8 w-8 set-diamond bg-set-purple/15 flex items-center justify-center rounded-md">
            <Diamond className="h-4 w-4 text-set-purple opacity-80" />
          </div>
          <div className="h-8 w-8 set-oval bg-set-red/15 flex items-center justify-center rounded-md">
            <Circle className="h-4 w-4 text-set-red opacity-80" />
          </div>
          <div className="h-8 w-8 bg-set-green/15 flex items-center justify-center rounded-md">
            <Triangle className="h-4 w-4 text-set-green opacity-80" />
          </div>
        </div>
        <div className="rounded-full bg-primary/5 p-4">
          <ArrowUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary opacity-80" />
        </div>
        <div className="space-y-2 sm:space-y-3">
          <h3 className="text-base sm:text-xl md:text-2xl font-medium">
            Upload your SET game image
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
          className="mt-2 sm:mt-3 ios-btn set-btn-purple"
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
