import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  email: string;
  display_name: string;
  level: number;
  experience: number;
  hp: number;
  max_hp: number;
  mp: number;
  max_mp: number;
  strength: number;
  agility: number;
  intelligence: number;
  sense: number;
  vitality: number;
  luck: number;
  stat_points: number;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
  color: string;
  streak: number;
  best_streak: number;
  created_at: string;
  updated_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  xp_earned: number;
}

export interface Quest {
  id: string;
  user_id: string;
  type: 'main' | 'daily' | 'penalty' | 'instant';
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed' | 'expired';
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  xp_reward: number;
  stat_points_reward: number;
  item_rewards: any[];
  requirements: Record<string, any>;
  progress: Record<string, any>;
  expires_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyQuestLog {
  id: string;
  user_id: string;
  date: string;
  completed: boolean;
  penalty_triggered: boolean;
  created_at: string;
}

export interface StatHistory {
  id: string;
  user_id: string;
  stat_name: string;
  old_value: number;
  new_value: number;
  change_reason: string;
  created_at: string;
}
