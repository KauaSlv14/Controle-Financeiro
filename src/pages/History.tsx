import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { TransactionsList } from "@/components/TransactionsList";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Transaction } from "@/types/database";

export default function History() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (user) {
      supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
        .then(({ data }) => { if (data) setTransactions(data as Transaction[]); });
    }
  }, [user]);

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <h1 className="font-display text-2xl font-bold">Histórico</h1>
        <TransactionsList transactions={transactions} />
      </div>
    </AppLayout>
  );
}
