import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export function PageLoader() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
        </div>
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    </div>
  );
}
