
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
}

const Results: React.FC<ResultsProps> = ({
  imageUrl,
  isProcessing,
  onReset,
  foundSets,
}) => {
  if (!imageUrl) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 sm:mt-10 animate-slide-up">
      <Card className="overflow-hidden rounded-3xl border-0 shadow-md ios-card relative">
        <div className="set-card-pattern"></div>
        <CardContent className="p-0 relative z-10">
          <div className="relative">
            {isProcessing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10 rounded-3xl">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full border-3 border-primary/60 border-t-transparent animate-spin mb-4 sm:mb-6"></div>
                <p className="text-foreground text-base sm:text-lg font-medium">
                  Processing image...
                </p>
              </div>
            )}
            <img
              src={imageUrl}
              alt="Set game"
              className={cn(
                "w-full h-auto object-contain max-h-[50vh] sm:max-h-[70vh] rounded-3xl",
                isProcessing ? "filter blur-sm" : "filter-none transition-all duration-500"
              )}
            />
            {!isProcessing && (
              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 bg-background/80 backdrop-blur-md px-4 py-2 sm:px-5 sm:py-3 text-sm sm:text-base font-medium text-foreground rounded-full shadow-sm flex items-center gap-2 border border-border/20">
                <span className="text-foreground/70">Found:</span> 
                <span className="font-semibold">{foundSets}</span> 
                <span>{foundSets === 1 ? "set" : "sets"}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center mt-6 sm:mt-8">
        <Button
          onClick={onReset}
          variant="outline"
          className="ios-btn hover-lift"
          disabled={isProcessing}
        >
          <Diamond className="h-3 w-3 text-set-purple opacity-70" />
          <Circle className="h-3 w-3 text-set-red opacity-70" />
          <Triangle className="h-3 w-3 text-set-green opacity-70" />
          <span>Try Another Image</span>
        </Button>
      </div>
    </div>
  );
};

export default Results;
