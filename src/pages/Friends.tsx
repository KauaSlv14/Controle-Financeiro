import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { FriendSearch } from "@/components/FriendSearch";
import { FriendRequests } from "@/components/FriendRequests";
import { FriendsList } from "@/components/FriendsList";

export default function Friends() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFriendUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <h1 className="font-display text-2xl font-bold">Amigos</h1>
        
        <FriendSearch />
        <FriendRequests onUpdate={handleFriendUpdate} />
        <FriendsList refreshTrigger={refreshTrigger} />
      </div>
    </AppLayout>
  );
}
