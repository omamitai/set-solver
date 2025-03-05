
import React, { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Info, Image, Github } from "lucide-react";
import { cn } from "@/lib/utils";

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-3 sm:px-6 py-2.5 sm:py-4",
        scrolled
          ? "bg-background/90 shadow-md backdrop-blur-xl border-b border-border/10"
          : "bg-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/15 flex items-center justify-center overflow-hidden shadow-sm border border-primary/20 pulse-soft">
          <Image className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-8 h-8 sm:w-10 sm:h-10 transition-all hover:bg-background/80 border-primary/20"
            aria-label="Project Information"
            onClick={() => window.open('https://github.com/yourusername/set-game-detector', '_blank')}
          >
            <Github className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-8 h-8 sm:w-10 sm:h-10 transition-all hover:bg-background/80 border-primary/20"
            aria-label="About SET Game"
          >
            <Info className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full w-8 h-8 sm:w-10 sm:h-10 transition-all hover:bg-background/80 border-primary/20"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            ) : (
              <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
