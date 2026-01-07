import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ConfettiProps {
  isActive: boolean;
  onComplete?: () => void;
}

const CONFETTI_COLORS = [
  "hsl(158 64% 42%)", // primary
  "hsl(45 93% 58%)",  // gold
  "hsl(142 76% 45%)", // success
  "hsl(200 80% 60%)", // blue
  "hsl(320 70% 60%)", // pink
];

export function Confetti({ isActive, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{ id: number; style: React.CSSProperties }>>([]);

  useEffect(() => {
    if (isActive) {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        style: {
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 0.5}s`,
          backgroundColor: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          width: `${Math.random() * 10 + 5}px`,
          height: `${Math.random() * 10 + 5}px`,
          borderRadius: Math.random() > 0.5 ? "50%" : "0",
        } as React.CSSProperties,
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive || particles.length === 0) return null;

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute top-0 animate-confetti"
          style={particle.style}
        />
      ))}
    </div>,
    document.body
  );
}
