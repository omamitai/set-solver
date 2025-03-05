
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
      <Card className="overflow-hidden rounded-3xl border-0 shadow-lg bg-background/50 backdrop-blur-sm ios-shadow">
        <CardContent className="p-0">
          <div className="relative">
            {isProcessing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10 rounded-3xl">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4 sm:mb-6"></div>
                <p className="text-foreground text-base sm:text-lg font-medium ios-text-gradient">
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
              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 bg-primary/80 backdrop-blur-md px-4 py-2 sm:px-5 sm:py-3 text-sm sm:text-base font-semibold text-white rounded-full shadow-lg">
                Found: {foundSets} {foundSets === 1 ? "set" : "sets"}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center mt-6 sm:mt-8">
        <Button
          onClick={onReset}
          variant="outline"
          className="hover-lift rounded-full text-sm sm:text-base font-medium px-6 py-2 h-auto border-primary/20 hover:bg-primary/5 transition-all duration-300"
          disabled={isProcessing}
        >
          Try Another Image
        </Button>
      </div>
    </div>
  );
};

export default Results;
