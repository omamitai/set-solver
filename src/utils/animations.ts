
import { useState, useEffect } from "react";

interface UseAnimationProps {
  initialState?: boolean;
  duration?: number;
  delay?: number;
}

export const useAnimation = ({
  initialState = false,
  duration = 500,
  delay = 0,
}: UseAnimationProps = {}) => {
  const [isVisible, setIsVisible] = useState(initialState);
  const [shouldRender, setShouldRender] = useState(initialState);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isVisible) {
      setShouldRender(true);
    } else {
      timeoutId = setTimeout(() => {
        setShouldRender(false);
      }, duration);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isVisible, duration]);

  const show = () => {
    setIsVisible(true);
  };

  const hide = () => {
    setIsVisible(false);
  };

  const toggle = () => {
    setIsVisible((prev) => !prev);
  };

  return {
    isVisible,
    shouldRender,
    show,
    hide,
    toggle,
    animationClass: isVisible ? "animate-fade-in" : "animate-fade-out",
  };
};

export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(ref);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return { ref: setRef, isIntersecting };
};

export const useScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollPosition = window.scrollY;
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const currentProgress = totalHeight > 0 ? scrollPosition / totalHeight : 0;
      setProgress(currentProgress);
    };

    window.addEventListener("scroll", updateProgress);
    updateProgress();

    return () => {
      window.removeEventListener("scroll", updateProgress);
    };
  }, []);

  return progress;
};
