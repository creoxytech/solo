/*
  # Add RPG System Features (Solo Leveling)

  1. Updates to Existing Tables
    - `users` table modifications
      - Add RPG stats: hp, max_hp, mp, max_mp, strength, agility, intelligence, sense, vitality, luck
      - Add stat_points for unallocated points
      - All stats start at base values appropriate for level 1

  2. New Tables
    - `quests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `type` (text) - 'main', 'daily', 'penalty', 'instant'
      - `title` (text) - Quest name
      - `description` (text) - Quest description
      - `status` (text) - 'active', 'completed', 'failed', 'expired'
      - `difficulty` (text) - 'easy', 'medium', 'hard', 'extreme'
      - `xp_reward` (integer) - XP gained on completion
      - `stat_points_reward` (integer) - Stat points gained
      - `item_rewards` (jsonb) - Array of item rewards
      - `requirements` (jsonb) - Quest completion requirements
      - `progress` (jsonb) - Current progress tracking
      - `expires_at` (timestamptz) - Quest expiration (for daily/timed quests)
      - `completed_at` (timestamptz) - Completion timestamp
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `daily_quest_log`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `date` (date) - Date of the daily quest
      - `completed` (boolean) - Whether daily quest was completed
      - `penalty_triggered` (boolean) - Whether penalty was triggered for skipping
      - `created_at` (timestamptz)

    - `stat_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `stat_name` (text) - Name of the stat changed
      - `old_value` (integer) - Previous value
      - `new_value` (integer) - New value
      - `change_reason` (text) - Reason for change (quest, level_up, manual)
      - `created_at` (timestamptz)

  3. Security
    - Enable RLS on all new tables
    - Users can only access their own quests, logs, and stat history
    - Restrict modifications to ensure game balance
*/

-- Add RPG stats to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'hp'
  ) THEN
    ALTER TABLE users ADD COLUMN hp integer DEFAULT 100;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'max_hp'
  ) THEN
    ALTER TABLE users ADD COLUMN max_hp integer DEFAULT 100;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'mp'
  ) THEN
    ALTER TABLE users ADD COLUMN mp integer DEFAULT 50;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'max_mp'
  ) THEN
    ALTER TABLE users ADD COLUMN max_mp integer DEFAULT 50;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'strength'
  ) THEN
    ALTER TABLE users ADD COLUMN strength integer DEFAULT 10;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'agility'
  ) THEN
    ALTER TABLE users ADD COLUMN agility integer DEFAULT 10;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'intelligence'
  ) THEN
    ALTER TABLE users ADD COLUMN intelligence integer DEFAULT 10;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'sense'
  ) THEN
    ALTER TABLE users ADD COLUMN sense integer DEFAULT 10;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'vitality'
  ) THEN
    ALTER TABLE users ADD COLUMN vitality integer DEFAULT 10;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'luck'
  ) THEN
    ALTER TABLE users ADD COLUMN luck integer DEFAULT 10;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'stat_points'
  ) THEN
    ALTER TABLE users ADD COLUMN stat_points integer DEFAULT 0;
  END IF;
END $$;

-- Create quests table
CREATE TABLE IF NOT EXISTS quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'instant',
  title text NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  difficulty text DEFAULT 'medium',
  xp_reward integer DEFAULT 0,
  stat_points_reward integer DEFAULT 0,
  item_rewards jsonb DEFAULT '[]'::jsonb,
  requirements jsonb DEFAULT '{}'::jsonb,
  progress jsonb DEFAULT '{}'::jsonb,
  expires_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quests"
  ON quests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quests"
  ON quests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quests"
  ON quests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own quests"
  ON quests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create daily quest log table
CREATE TABLE IF NOT EXISTS daily_quest_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  completed boolean DEFAULT false,
  penalty_triggered boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE daily_quest_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily quest log"
  ON daily_quest_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own daily quest log"
  ON daily_quest_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily quest log"
  ON daily_quest_log FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create stat history table
CREATE TABLE IF NOT EXISTS stat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stat_name text NOT NULL,
  old_value integer NOT NULL,
  new_value integer NOT NULL,
  change_reason text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stat history"
  ON stat_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own stat history"
  ON stat_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS quests_user_id_idx ON quests(user_id);
CREATE INDEX IF NOT EXISTS quests_status_idx ON quests(status);
CREATE INDEX IF NOT EXISTS quests_type_idx ON quests(type);
CREATE INDEX IF NOT EXISTS daily_quest_log_user_date_idx ON daily_quest_log(user_id, date);
CREATE INDEX IF NOT EXISTS stat_history_user_id_idx ON stat_history(user_id);
CREATE INDEX IF NOT EXISTS stat_history_created_at_idx ON stat_history(created_at);
