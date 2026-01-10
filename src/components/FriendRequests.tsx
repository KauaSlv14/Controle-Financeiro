import { useState, useEffect } from "react";
import { Check, X, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Friendship, Profile } from "@/types/database";

interface FriendRequestWithProfile extends Friendship {
  sender?: Profile;
  receiver?: Profile;
}

export function FriendRequests({ onUpdate }: { onUpdate?: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<FriendRequestWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get pending requests where I'm the receiver (friend_id)
      const { data: incoming, error: inError } = await supabase
        .from("friendships")
        .select("*")
        .eq("friend_id", user.id)
        .eq("status", "pending");

      if (inError) throw inError;

      // Get pending requests where I'm the sender
      const { data: outgoing, error: outError } = await supabase
        .from("friendships")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "pending");

      if (outError) throw outError;

      // Get profiles for all users
      const userIds = [
        ...(incoming?.map(r => r.user_id) || []),
        ...(outgoing?.map(r => r.friend_id) || []),
      ];

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", userIds);

        const profileMap = new Map((profiles || []).map(p => [p.id, p as Profile]));

        const incomingWithProfile = (incoming || []).map(r => ({
          ...r,
          sender: profileMap.get(r.user_id),
        })) as FriendRequestWithProfile[];

        const outgoingWithProfile = (outgoing || []).map(r => ({
          ...r,
          receiver: profileMap.get(r.friend_id),
        })) as FriendRequestWithProfile[];

        setRequests([...incomingWithProfile, ...outgoingWithProfile]);
      } else {
        setRequests([]);
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (requestId: string, accept: boolean) => {
    setProcessingId(requestId);
    try {
      const { error } = await supabase
        .from("friendships")
        .update({ status: accept ? "accepted" : "rejected" })
        .eq("id", requestId);

      if (error) throw error;

      toast({ title: accept ? "Amizade aceita!" : "Solicitação recusada" });
      fetchRequests();
      onUpdate?.();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setProcessingId(null);
    }
  };

  const cancelRequest = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("id", requestId);

      if (error) throw error;

      toast({ title: "Solicitação cancelada" });
      fetchRequests();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setProcessingId(null);
    }
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

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Nenhuma solicitação pendente</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg">Solicitações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.map((request) => {
          const isIncoming = request.friend_id === user?.id;
          const profile = isIncoming ? request.sender : request.receiver;
          
          return (
            <div
              key={request.id}
              className="flex items-center justify-between p-3 bg-secondary rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {profile?.username?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{profile?.username || "Usuário"}</p>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isIncoming ? (
                  <>
                    <Badge variant="outline" className="text-xs">Recebida</Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-success hover:text-success hover:bg-success/10"
                      onClick={() => handleResponse(request.id, true)}
                      disabled={processingId === request.id}
                    >
                      {processingId === request.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleResponse(request.id, false)}
                      disabled={processingId === request.id}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Badge variant="secondary" className="text-xs">Enviada</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs"
                      onClick={() => cancelRequest(request.id)}
                      disabled={processingId === request.id}
                    >
                      {processingId === request.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Cancelar"
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
