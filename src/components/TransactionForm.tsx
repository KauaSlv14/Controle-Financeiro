import { useState } from "react";
import { ArrowDown, ArrowUp, Banknote, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Goal } from "@/types/database";

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'income' | 'expense';
  goals?: Goal[];
  onSubmit: (data: {
    amount: number;
    source: 'physical' | 'pix';
    description: string;
    goalId?: string;
  }) => Promise<void>;
}

export function TransactionForm({ open, onOpenChange, type, goals, onSubmit }: TransactionFormProps) {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState<'physical' | 'pix'>('pix');
  const [description, setDescription] = useState("");
  const [goalId, setGoalId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const isIncome = type === 'income';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setLoading(true);
    try {
      await onSubmit({
        amount: parseFloat(amount),
        source,
        description,
        goalId: goalId || undefined,
      });
      setAmount("");
      setDescription("");
      setGoalId("");
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isIncome ? "bg-success/20" : "bg-destructive/20"
            )}>
              {isIncome ? (
                <ArrowDown className="h-5 w-5 text-success" />
              ) : (
                <ArrowUp className="h-5 w-5 text-destructive" />
              )}
            </div>
            <span className="font-display">
              {isIncome ? "Adicionar Entrada" : "Registrar Despesa"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10 text-lg font-semibold"
                required
              />
            </div>
          </div>

          {/* Source Selection */}
          <div className="space-y-2">
            <Label>Origem</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSource('physical')}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg border-2 transition-all",
                  source === 'physical'
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  source === 'physical' ? "bg-primary/20" : "bg-secondary"
                )}>
                  <Banknote className={cn(
                    "h-4 w-4",
                    source === 'physical' ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <span className={cn(
                  "font-medium",
                  source === 'physical' ? "text-primary" : "text-muted-foreground"
                )}>
                  Físico
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSource('pix')}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg border-2 transition-all",
                  source === 'pix'
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  source === 'pix' ? "bg-primary/20" : "bg-secondary"
                )}>
                  <Smartphone className={cn(
                    "h-4 w-4",
                    source === 'pix' ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <span className={cn(
                  "font-medium",
                  source === 'pix' ? "text-primary" : "text-muted-foreground"
                )}>
                  PIX
                </span>
              </button>
            </div>
          </div>

          {/* Link to Goal (for income) */}
          {isIncome && goals && goals.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="goal">Vincular a uma meta (opcional)</Label>
              <Select value={goalId} onValueChange={setGoalId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma meta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma meta</SelectItem>
                  {goals.filter(g => !g.is_completed).map((goal) => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {goal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder={isIncome ? "Ex: Salário de Janeiro" : "Ex: Compras do mercado"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !amount}
            variant={isIncome ? "default" : "destructive"}
          >
            {loading ? "Salvando..." : isIncome ? "Adicionar Entrada" : "Registrar Despesa"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
