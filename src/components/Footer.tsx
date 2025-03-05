
import React from "react";
import { Diamond, Circle, Triangle, Github } from "lucide-react";
import { cn } from "@/lib/utils";

const Footer: React.FC = () => {
  return (
    <footer className="py-4 px-3 sm:px-6 mt-auto border-t border-purple-100 bg-white bg-opacity-50 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1">
            <Diamond className="h-3 w-3 text-set-purple" />
            <Circle className="h-3 w-3 text-set-red" />
            <Triangle className="h-3 w-3 text-set-green" />
          </div>
          <p className="text-xs text-gray-500">
            SET Game Detector &copy; {new Date().getFullYear()}
          </p>
        </div>
        <div className="flex items-center gap-4 sm:gap-8">
          <a
            href="https://github.com/yourusername/set-detector"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-set-purple transition-colors flex items-center gap-1"
            aria-label="GitHub Repository"
          >
            <Github className="h-3 w-3" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
