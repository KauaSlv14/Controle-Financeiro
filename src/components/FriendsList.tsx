import { useState, useEffect } from "react";
import { Users, Loader2, ChevronRight, Banknote, Smartphone, Target, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Profile, Goal, Balance, Transaction } from "@/types/database";
import { cn } from "@/lib/utils";

interface FriendData {
  profile: Profile;
  balance?: Balance;
  goals: Goal[];
  transactions: Transaction[];
}

export function FriendsList({ refreshTrigger }: { refreshTrigger?: number }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFriend, setSelectedFriend] = useState<FriendData | null>(null);

  useEffect(() => {
    if (user) fetchFriends();
  }, [user, refreshTrigger]);

  const fetchFriends = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get accepted friendships
      const { data: friendships, error } = await supabase
        .from("friendships")
        .select("*")
        .eq("status", "accepted")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (error) throw error;

      if (!friendships || friendships.length === 0) {
        setFriends([]);
        setLoading(false);
        return;
      }

      // Get friend IDs
      const friendIds = friendships.map(f => 
        f.user_id === user.id ? f.friend_id : f.user_id
      );

      // Fetch profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", friendIds);

      // Fetch goals for friends
      const { data: goals } = await supabase
        .from("goals")
        .select("*")
        .in("user_id", friendIds);

      // Build friend data (we can't access balances or transactions directly due to RLS)
      const friendsData: FriendData[] = (profiles || []).map(profile => ({
        profile: profile as Profile,
        goals: (goals || []).filter(g => g.user_id === profile.id) as Goal[],
        transactions: [], // Can't access due to RLS
      }));

      setFriends(friendsData);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (friends.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Você ainda não tem amigos adicionados.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Use o campo acima para buscar por email!
          </p>
        </CardContent>
      </Card>
    );
  }

  if (selectedFriend) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedFriend(null)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Voltar
            </button>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={selectedFriend.profile.avatar_url || undefined} />
              <AvatarFallback className="text-lg">
                {selectedFriend.profile.username?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="font-display">{selectedFriend.profile.username || "Usuário"}</CardTitle>
              <p className="text-sm text-muted-foreground">{selectedFriend.profile.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="goals">
            <TabsList className="w-full">
              <TabsTrigger value="goals" className="flex-1">
                <Target className="h-4 w-4 mr-2" />
                Metas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="goals" className="mt-4 space-y-3">
              {selectedFriend.goals.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">
                  Nenhuma meta criada ainda.
                </p>
              ) : (
                selectedFriend.goals.map((goal) => {
                  const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                  return (
                    <div key={goal.id} className="p-3 bg-secondary rounded-lg space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={goal.image_url || `https://source.unsplash.com/100x100/?${encodeURIComponent(goal.name)}`}
                            alt={goal.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{goal.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                          </p>
                        </div>
                        <span className={cn(
                          "text-sm font-semibold",
                          percentage >= 100 ? "text-success" : "text-primary"
                        )}>
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <ProgressBar value={goal.current_amount} max={goal.target_amount} />
                    </div>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Meus Amigos ({friends.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {friends.map((friend) => {
          const totalGoals = friend.goals.length;
          const completedGoals = friend.goals.filter(g => g.is_completed).length;
          
          return (
            <button
              key={friend.profile.id}
              onClick={() => setSelectedFriend(friend)}
              className="w-full flex items-center justify-between p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={friend.profile.avatar_url || undefined} />
                  <AvatarFallback>
                    {friend.profile.username?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{friend.profile.username || "Usuário"}</p>
                  <p className="text-sm text-muted-foreground">
                    {totalGoals > 0 
                      ? `${completedGoals}/${totalGoals} metas concluídas`
                      : "Sem metas ainda"
                    }
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
