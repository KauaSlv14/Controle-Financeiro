import { useState, useEffect } from "react";
import { Plus, ArrowDown, ArrowUp } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { BalanceCard } from "@/components/BalanceCard";
import { GoalCard } from "@/components/GoalCard";
import { TransactionForm } from "@/components/TransactionForm";
import { GoalForm } from "@/components/GoalForm";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Goal, Balance } from "@/types/database";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState<Balance | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showIncome, setShowIncome] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    const [balanceRes, goalsRes] = await Promise.all([
      supabase.from("balances").select("*").eq("user_id", user!.id).single(),
      supabase.from("goals").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
    ]);
    if (balanceRes.data) setBalance(balanceRes.data as Balance);
    if (goalsRes.data) setGoals(goalsRes.data as Goal[]);
  };

  const handleTransaction = async (type: 'income' | 'expense', data: { amount: number; source: 'physical' | 'pix'; description: string; goalId?: string }) => {
    const { error } = await supabase.from("transactions").insert({
      user_id: user!.id,
      type,
      source: data.source,
      amount: data.amount,
      description: data.description,
      goal_id: data.goalId,
    });

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
      return;
    }

    const field = data.source === 'pix' ? 'pix_amount' : 'physical_amount';
    const newAmount = type === 'income'
      ? (balance?.[field] || 0) + data.amount
      : (balance?.[field] || 0) - data.amount;

    await supabase.from("balances").update({ [field]: newAmount }).eq("user_id", user!.id);

    if (data.goalId && type === 'income') {
      const goal = goals.find(g => g.id === data.goalId);
      if (goal) {
        const newGoalAmount = goal.current_amount + data.amount;
        await supabase.from("goals").update({
          current_amount: newGoalAmount,
          is_completed: newGoalAmount >= goal.target_amount,
          completed_at: newGoalAmount >= goal.target_amount ? new Date().toISOString() : null
        }).eq("id", data.goalId);
      }
    }

    toast({ title: type === 'income' ? "Entrada registrada!" : "Despesa registrada!" });
    fetchData();
  };

  const handleCreateGoal = async (data: { name: string; targetAmount: number; productLink?: string; imageUrl?: string }) => {
    const { error } = await supabase.from("goals").insert({
      user_id: user!.id,
      name: data.name,
      target_amount: data.targetAmount,
      product_link: data.productLink,
      image_url: data.imageUrl,
    });

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
      return;
    }

    toast({ title: "Meta criada!" });
    fetchData();
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <h1 className="font-display text-2xl font-bold">Olá! 👋</h1>

        <BalanceCard physicalAmount={balance?.physical_amount || 0} pixAmount={balance?.pix_amount || 0} />

        <div className="flex gap-3">
          <Button onClick={() => setShowIncome(true)} className="flex-1 gap-2">
            <ArrowDown className="h-4 w-4" /> Entrada
          </Button>
          <Button onClick={() => setShowExpense(true)} variant="outline" className="flex-1 gap-2">
            <ArrowUp className="h-4 w-4" /> Despesa
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Minhas Metas</h2>
          <Button size="sm" variant="ghost" onClick={() => setShowGoalForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> Nova
          </Button>
        </div>

        <div className="space-y-4">
          {goals.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Crie sua primeira meta!</p>
          ) : (
            goals.slice(0, 3).map((goal) => <GoalCard key={goal.id} goal={goal} onGoalUpdated={fetchData} />)
          )}
        </div>

        <TransactionForm open={showIncome} onOpenChange={setShowIncome} type="income" goals={goals} onSubmit={(data) => handleTransaction('income', data)} />
        <TransactionForm open={showExpense} onOpenChange={setShowExpense} type="expense" onSubmit={(data) => handleTransaction('expense', data)} />
        <GoalForm open={showGoalForm} onOpenChange={setShowGoalForm} onSubmit={handleCreateGoal} />
      </div>
    </AppLayout>
  );
}
