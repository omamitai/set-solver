
import React from "react";
import { Diamond, Circle, Triangle } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="py-6 sm:py-8 px-4 sm:px-6 mt-10 sm:mt-16 border-t border-border/20 bg-background/70 backdrop-blur-sm relative overflow-hidden">
      <div className="set-card-pattern"></div>
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <Diamond className="h-3 w-3 text-set-purple opacity-70" />
            <Circle className="h-3 w-3 text-set-red opacity-70" />
            <Triangle className="h-3 w-3 text-set-green opacity-70" />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            SET Game Detector &copy; {new Date().getFullYear()}
          </p>
        </div>
        <div className="flex items-center gap-5 sm:gap-8">
          <a
            href="https://github.com/username/set-game-detector"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm text-muted-foreground hover:text-set-purple transition-colors flex items-center gap-1"
          >
            <Diamond className="h-3 w-3" />
            GitHub
          </a>
          <a
            href="#"
            className="text-xs sm:text-sm text-muted-foreground hover:text-set-red transition-colors flex items-center gap-1"
          >
            <Circle className="h-3 w-3" />
            Privacy
          </a>
          <a
            href="#"
            className="text-xs sm:text-sm text-muted-foreground hover:text-set-green transition-colors flex items-center gap-1"
          >
            <Triangle className="h-3 w-3" />
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
