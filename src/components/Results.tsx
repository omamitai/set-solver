
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Diamond, Circle, Triangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultsProps {
  imageUrl: string | null;
  isProcessing: boolean;
  onReset: () => void;
  foundSets: number;
  processedImageUrl?: string | null;
}

const Results: React.FC<ResultsProps> = ({
  imageUrl,
  isProcessing,
  onReset,
  foundSets,
  processedImageUrl,
}) => {
  if (!imageUrl) return null;

  // Display the processed image if available, otherwise show the original
  const displayImageUrl = processedImageUrl || imageUrl;

  return (
    <div className="w-full max-w-4xl mx-auto animate-slide-up">
      <Card className="overflow-hidden rounded-2xl border-0 shadow-md ios-card relative">
        <div className="set-card-pattern opacity-20"></div>
        <CardContent className="p-0 relative z-10">
          <div className="relative">
            {isProcessing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10 rounded-2xl">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border-3 border-primary/60 border-t-transparent animate-spin mb-3 sm:mb-4"></div>
                <p className="text-foreground text-sm sm:text-base font-medium">
                  Processing image...
                </p>
              </div>
            )}
            <img
              src={displayImageUrl}
              alt="Set game"
              className={cn(
                "w-full h-auto object-contain max-h-[40vh] sm:max-h-[50vh] rounded-2xl",
                isProcessing ? "filter blur-sm" : "filter-none transition-all duration-500"
              )}
            />
            {!isProcessing && (
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-background/80 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-foreground rounded-full shadow-sm flex items-center gap-1.5 border border-border/20">
                <span className="text-foreground/70">Found:</span> 
                <span className="font-semibold">{foundSets}</span> 
                <span>{foundSets === 1 ? "set" : "sets"}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center mt-4 sm:mt-5">
        <Button
          onClick={onReset}
          variant="outline"
          size="sm"
          className="ios-btn hover-lift px-4 py-1.5 h-auto text-xs sm:text-sm"
          disabled={isProcessing}
        >
          <Diamond className="h-2.5 w-2.5 text-set-purple opacity-70" />
          <Circle className="h-2.5 w-2.5 text-set-red opacity-70" />
          <Triangle className="h-2.5 w-2.5 text-set-green opacity-70" />
          <span>Try Another Image</span>
        </Button>
      </div>
    </div>
  );
};

export default Results;
