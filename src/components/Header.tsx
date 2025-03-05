
import React, { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Diamond, Circle, Triangle, Sparkles } from "lucide-react";
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
        <div className="animate-fade-in flex items-center gap-2.5">
          <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/15 flex items-center justify-center overflow-hidden shadow-sm border border-primary/20 pulse-soft">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <div className="set-card-pattern"></div>
          </div>
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-primary via-set-purple to-set-red bg-clip-text text-transparent">
                SET Game
              </h1>
              <div className="bg-set-purple/15 px-2 py-0.5 rounded-full border border-set-purple/20">
                <span className="text-xs font-medium text-set-purple">Detector</span>
              </div>
            </div>
            <div className="flex items-center gap-1 -mt-0.5">
              <Diamond className="h-3 w-3 text-set-purple opacity-80" />
              <Circle className="h-3 w-3 text-set-red opacity-80" />
              <Triangle className="h-3 w-3 text-set-green opacity-80" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center space-x-2 mr-3 bg-background/30 backdrop-blur-sm py-1.5 px-3 rounded-full border border-border/10">
            <Diamond className="h-4 w-4 text-set-purple opacity-80" />
            <Circle className="h-4 w-4 text-set-red opacity-80" />
            <Triangle className="h-4 w-4 text-set-green opacity-80" />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full w-8 h-8 sm:w-10 sm:h-10 animate-fade-in transition-all hover:bg-background/80 border-primary/20"
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
