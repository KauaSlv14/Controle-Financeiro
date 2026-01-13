import { useState } from "react";
import { ExternalLink, Sparkles, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Confetti } from "@/components/ui/confetti";
import { Goal } from "@/types/database";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GoalDetails } from "./GoalDetails";

interface GoalCardProps {
  goal: Goal;
  onAddFunds?: (goalId: string) => void;
  onGoalUpdated?: () => void;
}

export function GoalCard({ goal, onAddFunds, onGoalUpdated }: GoalCardProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationShown, setCelebrationShown] = useState(goal.is_completed);
  const [showDetails, setShowDetails] = useState(false);

  const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  const isCompleted = percentage >= 100;

  // Show celebration when goal is completed for the first time
  if (isCompleted && !celebrationShown) {
    setShowCelebration(true);
    setCelebrationShown(true);
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getDefaultImage = (name: string) => {
    return `https://source.unsplash.com/400x300/?${encodeURIComponent(name)},product`;
  };

  return (
    <>
      <GoalDetails
        goal={goal}
        open={showDetails}
        onOpenChange={setShowDetails}
        onGoalUpdated={onGoalUpdated}
      />
      <Confetti isActive={showCelebration} onComplete={() => setShowCelebration(false)} />

      <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-gold" />
              Parabéns!
              <Sparkles className="h-6 w-6 text-gold" />
            </DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full gradient-gold flex items-center justify-center shadow-gold-glow animate-celebration">
              <Target className="h-12 w-12 text-gold-foreground" />
            </div>
            <p className="text-lg text-muted-foreground">
              Você alcançou sua meta de <span className="font-semibold text-foreground">{goal.name}</span>!
            </p>
            <p className="text-2xl font-display font-bold mt-2 text-success">
              {formatCurrency(goal.target_amount)}
            </p>
          </div>
          <Button onClick={() => setShowCelebration(false)} className="w-full">
            Continuar Economizando!
          </Button>
        </DialogContent>
      </Dialog>

      <Card
        className={cn(
          "group overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer",
          isCompleted && "ring-2 ring-success/50 shadow-glow"
        )}
        onClick={() => setShowDetails(true)}
      >
        <CardContent className="p-0">
          <div className="flex gap-4 p-4">
            {/* Product Image */}
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0 flex items-center justify-center">
              <img
                src={goal.image_url || getDefaultImage(goal.name)}
                alt={goal.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  // If it's already the default image, show a placeholder icon by hiding the image and letting the parent div show background
                  if (target.src.includes('unsplash')) {
                    target.style.display = 'none';
                    target.parentElement?.classList.add('bg-muted');
                  } else {
                    target.src = getDefaultImage(goal.name);
                  }
                }}
              />
              {/* Fallback Icon (visible when img is hidden) */}
              <Target className="absolute w-8 h-8 text-muted-foreground opacity-0 img-error-fallback" />
              <style>{`
                 img[style*="display: none"] + .img-error-fallback {
                   opacity: 1;
                   position: static;
                 }
               `}</style>
            </div>

            {/* Goal Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display font-semibold text-lg truncate">
                  {goal.name}
                </h3>
                {goal.product_link && (
                  <a
                    href={goal.product_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>

              {/* Progress */}
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium number-display">
                    {formatCurrency(goal.current_amount)}
                  </span>
                  <span className="text-muted-foreground number-display">
                    {formatCurrency(goal.target_amount)}
                  </span>
                </div>
                <ProgressBar value={goal.current_amount} max={goal.target_amount} />
                <div className="flex justify-between items-center mt-2">
                  <span className={cn(
                    "text-sm font-medium",
                    isCompleted ? "text-success" : "text-muted-foreground"
                  )}>
                    {percentage.toFixed(0)}%
                  </span>
                  {!isCompleted && onAddFunds && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddFunds(goal.id);
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      Adicionar fundos
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
