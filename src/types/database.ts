export interface Profile {
  id: string;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Balance {
  id: string;
  user_id: string;
  physical_amount: number;
  pix_amount: number;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  product_link: string | null;
  image_url: string | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  source: 'physical' | 'pix';
  amount: number;
  description: string | null;
  goal_id: string | null;
  created_at: string;
}

export interface RecurringTransaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  source: 'physical' | 'pix';
  amount: number;
  description: string | null;
  frequency: 'daily' | 'weekly' | 'monthly';
  day_of_month: number | null;
  day_of_week: number | null;
  is_active: boolean;
  last_processed_at: string | null;
  created_at: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}
