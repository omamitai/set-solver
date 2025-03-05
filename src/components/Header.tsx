
import React, { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Diamond, Circle, Triangle } from "lucide-react";
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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-3 sm:px-4 py-2.5 sm:py-3",
        scrolled
          ? "bg-background/90 shadow-sm backdrop-blur-xl border-b border-border/10"
          : "bg-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="animate-fade-in flex items-center gap-1.5">
          <div className="relative h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/5 flex items-center justify-center overflow-hidden shadow-sm border border-primary/10">
            <span className="text-primary font-bold text-sm sm:text-base relative z-10">S</span>
            <div className="set-card-pattern"></div>
          </div>
          <div className="flex flex-col items-start">
            <h1 className="text-base sm:text-lg font-semibold tracking-tight">
              SET Game
            </h1>
            <span className="text-[10px] sm:text-xs text-muted-foreground -mt-0.5">Detector</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex space-x-1 mr-1">
            <Diamond className="h-3.5 w-3.5 text-set-purple opacity-70" />
            <Circle className="h-3.5 w-3.5 text-set-red opacity-70" />
            <Triangle className="h-3.5 w-3.5 text-set-green opacity-70" />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full w-7 h-7 sm:w-8 sm:h-8 animate-fade-in transition-all hover:bg-background/80 border-primary/10"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            ) : (
              <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
