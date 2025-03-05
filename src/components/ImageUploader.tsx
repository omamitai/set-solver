
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
        "w-full max-w-sm mx-auto animate-scale-in transition-all duration-300",
        "rounded-2xl border-2 border-dashed p-4 text-center",
        "ios-card relative overflow-hidden",
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
      <div className="set-card-pattern opacity-30"></div>
      <div className="flex flex-col items-center justify-center gap-2 relative z-10">
        {/* Compact icon row */}
        <div className="flex items-center justify-center space-x-2">
          <div className="h-4 w-4 set-diamond bg-set-purple/20 flex items-center justify-center rounded-md shadow-sm">
            <Diamond className="h-2 w-2 text-set-purple" />
          </div>
          <div className="h-4 w-4 set-oval bg-set-red/20 flex items-center justify-center rounded-md shadow-sm">
            <Circle className="h-2 w-2 text-set-red" />
          </div>
          <div className="h-4 w-4 bg-set-green/20 flex items-center justify-center rounded-md shadow-sm">
            <Triangle className="h-2 w-2 text-set-green" />
          </div>
        </div>
        
        {/* Upload arrow and text */}
        <div className="flex flex-col items-center space-y-1.5">
          <div className="rounded-full bg-primary/10 p-1.5 shadow-sm pulse-soft">
            <ArrowUp className="h-3 w-3 text-primary" />
          </div>
          
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold">
              Upload your SET game image
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Drag and drop your image here, or tap to browse
            </p>
          </div>
        </div>
        
        {/* Button */}
        <Button
          onClick={handleButtonClick}
          className="ios-btn set-btn-purple font-medium px-4 py-1 h-auto text-xs mt-1"
          disabled={isProcessing}
        >
          Select Image
        </Button>
        
        {/* File info */}
        <p className="text-[10px] text-muted-foreground">
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
