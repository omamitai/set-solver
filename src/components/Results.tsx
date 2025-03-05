
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
    <div className="w-full max-w-4xl mx-auto mt-8 animate-slide-up">
      <Card className="overflow-hidden glass glass-dark card-shadow">
        <CardContent className="p-0">
          <div className="relative">
            {isProcessing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
                <p className="text-foreground font-medium">Processing image...</p>
              </div>
            )}
            <img
              src={imageUrl}
              alt="Set game"
              className={cn(
                "w-full h-auto object-contain max-h-[70vh]",
                isProcessing ? "filter blur-sm" : "filter-none transition-all duration-500"
              )}
            />
            {!isProcessing && (
              <div className="absolute top-4 right-4 glass glass-dark rounded-full px-4 py-2 text-sm font-medium">
                Found: {foundSets} {foundSets === 1 ? "set" : "sets"}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center mt-6">
        <Button
          onClick={onReset}
          variant="outline"
          className="hover-lift"
          disabled={isProcessing}
        >
          Try Another Image
        </Button>
      </div>
    </div>
  );
};

export default Results;
