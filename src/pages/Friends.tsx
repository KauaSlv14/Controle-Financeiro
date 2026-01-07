import { AppLayout } from "@/components/AppLayout";
import { Users } from "lucide-react";

export default function Friends() {
  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <h1 className="font-display text-2xl font-bold">Amigos</h1>
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Em breve você poderá adicionar amigos e acompanhar o progresso deles!</p>
        </div>
      </div>
    </AppLayout>
  );
}
