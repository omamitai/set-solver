
import React from "react";
import { Diamond, Circle, Triangle, Github, Shield, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const Footer: React.FC = () => {
  return (
    <footer className="py-4 sm:py-6 px-3 sm:px-6 mt-auto border-t border-border/20 bg-background/80 backdrop-blur-sm relative overflow-hidden">
      <div className="set-card-pattern opacity-20"></div>
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 relative z-10">
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1">
            <Diamond className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-set-purple opacity-70" />
            <Circle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-set-red opacity-70" />
            <Triangle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-set-green opacity-70" />
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            SET Game Detector &copy; {new Date().getFullYear()}
          </p>
        </div>
        <div className="flex items-center gap-4 sm:gap-8">
          <a
            href="https://github.com/yourname/set-game-detector"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] sm:text-xs text-muted-foreground hover:text-set-purple transition-colors flex items-center gap-1"
            aria-label="GitHub Repository"
          >
            <Github className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            GitHub
          </a>
          <a
            href="/privacy"
            className="text-[10px] sm:text-xs text-muted-foreground hover:text-set-red transition-colors flex items-center gap-1"
            aria-label="Privacy Policy"
          >
            <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            Privacy
          </a>
          <a
            href="/terms"
            className="text-[10px] sm:text-xs text-muted-foreground hover:text-set-green transition-colors flex items-center gap-1"
            aria-label="Terms of Service"
          >
            <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
