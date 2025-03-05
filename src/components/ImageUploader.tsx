
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, Diamond, Circle, Triangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTheme } from "@/context/ThemeContext";

interface ImageUploaderProps {
  onImageSelected: (image: File) => void;
  isProcessing: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
        "w-full max-w-sm mx-auto animate-scale-in transition-all duration-300",
        "rounded-2xl border-2 border-dashed p-6 text-center",
        isDark 
          ? "bg-background/30 border-primary/40 backdrop-blur-md shadow-xl" 
          : "bg-white/80 backdrop-blur-sm shadow-lg",
        dragActive 
          ? "border-primary/60 bg-primary/5 scale-[1.02]" 
          : isDark ? "border-border/70 scale-100" : "border-border/50 scale-100",
        isProcessing ? "opacity-50 pointer-events-none" : "opacity-100"
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex items-center justify-center space-x-2">
          <Diamond className="h-4 w-4 sm:h-5 sm:w-5 text-set-purple opacity-70" />
          <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-set-red opacity-70" />
          <Triangle className="h-4 w-4 sm:h-5 sm:w-5 text-set-green opacity-70" />
        </div>
        
        <div className="flex flex-col items-center gap-3">
          <div className={cn(
            "rounded-full p-2.5 shadow-sm pulse-soft",
            isDark ? "bg-primary/20" : "bg-primary/10"
          )}>
            <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          
          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-semibold">
              Upload your SET game image
            </h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop your image here, or tap to browse
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleButtonClick}
          className={cn(
            "font-medium",
            isDark 
              ? "bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30" 
              : "ios-btn set-btn-purple"
          )}
          disabled={isProcessing}
        >
          Select Image
        </Button>
        
        <p className="text-xs text-muted-foreground">
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
