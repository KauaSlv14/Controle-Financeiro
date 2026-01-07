import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { GoalCard } from "@/components/GoalCard";
import { GoalForm } from "@/components/GoalForm";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Goal } from "@/types/database";

export default function Goals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showGoalForm, setShowGoalForm] = useState(false);

  useEffect(() => {
    if (user) fetchGoals();
  }, [user]);

  const fetchGoals = async () => {
    const { data } = await supabase.from("goals").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
    if (data) setGoals(data as Goal[]);
  };

  const handleCreateGoal = async (data: { name: string; targetAmount: number; productLink?: string; imageUrl?: string }) => {
    const { error } = await supabase.from("goals").insert({
      user_id: user!.id, name: data.name, target_amount: data.targetAmount, product_link: data.productLink, image_url: data.imageUrl,
    });
    if (error) { toast({ variant: "destructive", title: "Erro", description: error.message }); return; }
    toast({ title: "Meta criada!" });
    fetchGoals();
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">Minhas Metas</h1>
          <Button onClick={() => setShowGoalForm(true)}><Plus className="h-4 w-4 mr-2" /> Nova Meta</Button>
        </div>
        <div className="space-y-4">
          {goals.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">Crie sua primeira meta para começar!</p>
          ) : (
            goals.map((goal) => <GoalCard key={goal.id} goal={goal} />)
          )}
        </div>
        <GoalForm open={showGoalForm} onOpenChange={setShowGoalForm} onSubmit={handleCreateGoal} />
      </div>
    </AppLayout>
  );
}
