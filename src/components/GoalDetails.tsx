import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Goal, Transaction } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, TrendingUp, Calendar, Target } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";

interface GoalDetailsProps {
    goal: Goal;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GoalDetails({ goal, open, onOpenChange }: GoalDetailsProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchTransactions();
        }
    }, [open, goal.id]);

    const fetchTransactions = async () => {
        setLoading(true);
        const { data } = await supabase
            .from("transactions")
            .select("*")
            .eq("goal_id", goal.id)
            .eq("type", "income") // Only show income (deposits) for goals
            .order("created_at", { ascending: false });

        if (data) {
            setTransactions(data as Transaction[]);
        }
        setLoading(false);
    };

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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl w-[95vw] sm:w-full">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl flex items-center gap-2">
                        <Target className="w-6 h-6 text-primary" />
                        {goal.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-6">
                        <div className="aspect-video rounded-lg overflow-hidden bg-secondary relative flex items-center justify-center group">
                            <img
                                src={goal.image_url || getDefaultImage(goal.name)}
                                alt={goal.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    if (target.src.includes('unsplash')) {
                                        target.style.display = 'none';
                                        target.parentElement?.classList.add('bg-muted');
                                    } else {
                                        target.src = getDefaultImage(goal.name);
                                    }
                                }}
                            />
                            <Target className="absolute w-12 h-12 text-muted-foreground opacity-0 img-error-fallback" />
                            <style>{`
                 img[style*="display: none"] + .img-error-fallback {
                   opacity: 1;
                 }
               `}</style>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Progresso</span>
                                <span className="font-medium text-foreground">{formatCurrency(goal.current_amount)} de {formatCurrency(goal.target_amount)}</span>
                            </div>
                            <ProgressBar value={goal.current_amount} max={goal.target_amount} />
                            <p className="text-right text-xs text-muted-foreground">
                                {((goal.current_amount / goal.target_amount) * 100).toFixed(0)}% concluído
                            </p>
                        </div>

                        {goal.product_link && (
                            <a
                                href={goal.product_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-primary hover:underline text-sm font-medium p-2 bg-primary/5 rounded-md transition-colors hover:bg-primary/10 w-fit"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Ver produto na loja
                            </a>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2 text-foreground">
                            <TrendingUp className="w-4 h-4 text-success" />
                            Histórico de Depósitos
                        </h3>

                        <ScrollArea className="h-[300px] pr-4 rounded-md border p-4 bg-muted/20">
                            <div className="space-y-3">
                                {loading ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">Carregando histórico...</p>
                                ) : transactions.length === 0 ? (
                                    <div className="text-center py-8 space-y-2">
                                        <p className="text-sm text-muted-foreground">Nenhum depósito realizado ainda.</p>
                                        <p className="text-xs text-muted-foreground/60">Adicione uma entrada vinculada a esta meta para vê-la aqui.</p>
                                    </div>
                                ) : (
                                    transactions.map((t) => (
                                        <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-card border shadow-sm transition-colors hover:border-primary/30">
                                            <div className="space-y-1">
                                                <p className="font-medium text-sm text-success">+{formatCurrency(t.amount)}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Calendar className="w-3 h-3" />
                                                    {format(new Date(t.created_at), "d 'de' MMM, yyyy", { locale: ptBR })}
                                                </div>
                                            </div>
                                            {t.description && (
                                                <span className="text-xs text-muted-foreground truncate max-w-[100px]" title={t.description}>
                                                    {t.description}
                                                </span>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
