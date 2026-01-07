import { Banknote, Smartphone, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BalanceCardProps {
  physicalAmount: number;
  pixAmount: number;
  className?: string;
}

export function BalanceCard({ physicalAmount, pixAmount, className }: BalanceCardProps) {
  const totalAmount = physicalAmount + pixAmount;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0">
        {/* Total Balance */}
        <div className="gradient-primary p-6 text-primary-foreground">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-5 w-5 opacity-80" />
            <span className="text-sm font-medium opacity-80">Saldo Total</span>
          </div>
          <p className="text-3xl font-display font-bold number-display">
            {formatCurrency(totalAmount)}
          </p>
        </div>

        {/* Balance Breakdown */}
        <div className="grid grid-cols-2 divide-x divide-border">
          {/* Physical */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <Banknote className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Físico</span>
            </div>
            <p className="text-lg font-semibold number-display">
              {formatCurrency(physicalAmount)}
            </p>
          </div>

          {/* PIX */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <Smartphone className="h-4 w-4 text-accent-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">PIX</span>
            </div>
            <p className="text-lg font-semibold number-display">
              {formatCurrency(pixAmount)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
