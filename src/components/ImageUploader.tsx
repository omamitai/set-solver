
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
        "rounded-3xl border-2 border-dashed p-5 sm:p-8 text-center", // Reduced padding
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
      <div className="flex flex-col items-center justify-center gap-3 sm:gap-5 relative z-10">
        <div className="flex items-center justify-center space-x-4">
          <div className="h-8 w-8 sm:h-10 sm:w-10 set-diamond bg-set-purple/20 flex items-center justify-center rounded-xl shadow-sm">
            <Diamond className="h-4 w-4 sm:h-5 sm:w-5 text-set-purple" />
          </div>
          <div className="h-8 w-8 sm:h-10 sm:w-10 set-oval bg-set-red/20 flex items-center justify-center rounded-xl shadow-sm">
            <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-set-red" />
          </div>
          <div className="h-8 w-8 sm:h-10 sm:w-10 bg-set-green/20 flex items-center justify-center rounded-xl shadow-sm">
            <Triangle className="h-4 w-4 sm:h-5 sm:w-5 text-set-green" />
          </div>
        </div>
        <div className="rounded-full bg-primary/10 p-4 shadow-sm pulse-soft">
          <ArrowUp className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
        </div>
        <div className="space-y-2 sm:space-y-3">
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold">
            Upload your SET game image
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Drag and drop your image here, or tap to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Supports PNG, JPG, JPEG (max 10MB)
          </p>
        </div>
        <Button
          onClick={handleButtonClick}
          className="mt-2 ios-btn set-btn-purple font-semibold px-6 py-2 h-auto text-sm sm:text-base"
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
