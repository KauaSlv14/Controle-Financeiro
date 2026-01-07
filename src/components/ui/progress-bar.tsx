import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  showGlow?: boolean;
}

export function ProgressBar({ value, max, className, showGlow = true }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const getColor = () => {
    if (percentage >= 100) return "bg-success";
    if (percentage >= 75) return "bg-gold";
    if (percentage >= 50) return "gradient-primary";
    return "bg-primary";
  };

  const getGlow = () => {
    if (!showGlow) return "";
    if (percentage >= 100) return "shadow-glow";
    if (percentage >= 75) return "shadow-gold-glow";
    return "";
  };

  return (
    <div className={cn("w-full h-3 bg-secondary rounded-full overflow-hidden", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500 ease-out",
          getColor(),
          getGlow(),
          percentage >= 100 && "animate-pulse-glow"
        )}
        style={{ width: `${percentage}%` }}
      >
        {percentage > 10 && (
          <div className="h-full w-full progress-glow" />
        )}
      </div>
    </div>
  );
}
