
import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-6 py-3 bg-background/80 backdrop-blur-xl border-b border-border/10">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="animate-fade-in flex items-center gap-2">
          {/* S logo removed as requested */}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="rounded-xl w-8 h-8 sm:w-9 sm:h-9 animate-fade-in transition-all hover:bg-background/80 border-primary/10"
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
