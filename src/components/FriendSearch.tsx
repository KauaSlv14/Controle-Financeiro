import { useState } from "react";
import { Search, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types/database";

export function FriendSearch() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [foundUser, setFoundUser] = useState<Profile | null>(null);
  const [sending, setSending] = useState(false);

  const handleSearch = async () => {
    if (!email.trim()) return;
    
    setLoading(true);
    setFoundUser(null);
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        if (data.id === user?.id) {
          toast({ variant: "destructive", title: "Ops!", description: "Você não pode adicionar você mesmo!" });
          return;
        }
        setFoundUser(data as Profile);
      } else {
        toast({ variant: "destructive", title: "Não encontrado", description: "Nenhum usuário com este email." });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async () => {
    if (!foundUser || !user) return;
    
    setSending(true);
    try {
      // Check if request already exists
      const { data: existing } = await supabase
        .from("friendships")
        .select("*")
        .or(`and(user_id.eq.${user.id},friend_id.eq.${foundUser.id}),and(user_id.eq.${foundUser.id},friend_id.eq.${user.id})`)
        .maybeSingle();
      
      if (existing) {
        toast({ variant: "destructive", title: "Ops!", description: "Solicitação já existe ou vocês já são amigos." });
        return;
      }

      const { error } = await supabase.from("friendships").insert({
        user_id: user.id,
        friend_id: foundUser.id,
        status: "pending",
      });

      if (error) throw error;

      toast({ title: "Sucesso!", description: "Solicitação de amizade enviada." });
      setFoundUser(null);
      setEmail("");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <h3 className="font-display font-semibold">Adicionar amigo</h3>
        
        <div className="flex gap-2">
          <Input
            placeholder="Email do amigo..."
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading || !email.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {foundUser && (
          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={foundUser.avatar_url || undefined} />
                <AvatarFallback>{foundUser.username?.[0]?.toUpperCase() || "?"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{foundUser.username || "Usuário"}</p>
                <p className="text-sm text-muted-foreground">{foundUser.email}</p>
              </div>
            </div>
            <Button onClick={sendFriendRequest} disabled={sending} size="sm">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
