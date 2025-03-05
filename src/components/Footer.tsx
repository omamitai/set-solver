
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="py-8 px-6 mt-12 border-t border-border">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <p className="text-sm text-muted-foreground">
            Set Game Detector &copy; {new Date().getFullYear()}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/username/set-game-detector"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          <a
            href="#"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy
          </a>
          <a
            href="#"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
