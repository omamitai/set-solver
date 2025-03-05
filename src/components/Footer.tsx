
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="py-6 sm:py-8 px-4 sm:px-6 mt-10 sm:mt-16 border-t border-border/30 bg-set-gradient">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Set Game Detector &copy; {new Date().getFullYear()}
          </p>
        </div>
        <div className="flex items-center gap-5 sm:gap-8">
          <a
            href="https://github.com/username/set-game-detector"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            GitHub
          </a>
          <a
            href="#"
            className="text-xs sm:text-sm text-muted-foreground hover:text-secondary transition-colors"
          >
            Privacy
          </a>
          <a
            href="#"
            className="text-xs sm:text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
