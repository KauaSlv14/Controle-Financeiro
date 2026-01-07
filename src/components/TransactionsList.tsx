import { ArrowDown, ArrowUp, Banknote, Smartphone } from "lucide-react";
import { Transaction } from "@/types/database";
import { cn } from "@/lib/utils";

interface TransactionsListProps {
  transactions: Transaction[];
  className?: string;
}

export function TransactionsList({ transactions, className }: TransactionsListProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  if (transactions.length === 0) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        <p>Nenhuma transação ainda.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {transactions.map((transaction) => {
        const isIncome = transaction.type === 'income';
        const isPix = transaction.source === 'pix';

        return (
          <div
            key={transaction.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:shadow-md transition-shadow"
          >
            {/* Icon */}
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
              isIncome ? "bg-success/10" : "bg-destructive/10"
            )}>
              {isIncome ? (
                <ArrowDown className="h-5 w-5 text-success" />
              ) : (
                <ArrowUp className="h-5 w-5 text-destructive" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {transaction.description || (isIncome ? 'Entrada' : 'Despesa')}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatDate(transaction.created_at)}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  {isPix ? (
                    <Smartphone className="h-3 w-3" />
                  ) : (
                    <Banknote className="h-3 w-3" />
                  )}
                  <span>{isPix ? 'PIX' : 'Físico'}</span>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className={cn(
              "font-semibold number-display",
              isIncome ? "text-success" : "text-destructive"
            )}>
              {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
