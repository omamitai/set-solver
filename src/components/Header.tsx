
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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between",
        scrolled
          ? "bg-background/70 shadow-sm backdrop-blur-lg ios-shadow border-b border-border/10"
          : "bg-transparent"
      )}
    >
      <div className="animate-fade-in flex items-center gap-2">
        <div className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary/10 flex items-center justify-center pulse-soft overflow-hidden">
          <span className="text-primary font-bold text-base sm:text-lg relative z-10">S</span>
          <div className="set-card-pattern"></div>
        </div>
        <div className="flex flex-col items-start">
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight ios-text-gradient">
            SET Game
          </h1>
          <span className="text-xs text-muted-foreground -mt-1">Detector</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex space-x-1 mr-2">
          <Diamond className="h-4 w-4 text-set-purple" />
          <Circle className="h-4 w-4 text-set-red" />
          <Triangle className="h-4 w-4 text-set-green" />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full w-8 h-8 sm:w-10 sm:h-10 animate-fade-in transition-all hover:bg-background/80 border-primary/10 ios-shadow"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          ) : (
            <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          )}
        </Button>
      </div>
    </header>
  );
};

export default Header;
