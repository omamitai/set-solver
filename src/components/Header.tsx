
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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-3 sm:px-6 py-2.5 sm:py-4",
        scrolled
          ? "bg-white/90 shadow-sm backdrop-blur-xl border-b border-purple-100/40"
          : "bg-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <a href="/" className="animate-fade-in flex items-center gap-2 group">
          <div className="relative h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shadow-sm border border-primary/20 group-hover:bg-primary/15 transition-colors">
            <span className="text-primary font-bold text-base relative z-10">S</span>
            <div className="set-card-pattern"></div>
          </div>
          <div className="flex flex-col items-start">
            <h1 className="text-xl font-semibold tracking-tight">
              SET Game
            </h1>
            <span className="text-xs text-muted-foreground -mt-0.5">Detector</span>
          </div>
        </a>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex space-x-1.5 mr-2">
            <Diamond className="h-4 w-4 text-set-purple" />
            <Circle className="h-4 w-4 text-set-red" />
            <Triangle className="h-4 w-4 text-set-green" />
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full w-9 h-9 animate-fade-in transition-all hover:bg-white/80 border-primary/20"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun className="h-4.5 w-4.5 text-primary" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-primary" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
