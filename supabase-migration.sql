-- Migration untuk menambahkan fitur baru
-- Jalankan ini jika tabel habits sudah ada

-- 1. Tambah kolom recurring_type dan last_completed_date
ALTER TABLE public.habits 
ADD COLUMN IF NOT EXISTS recurring_type TEXT NOT NULL DEFAULT 'once' CHECK (recurring_type IN ('once', 'daily', 'weekly')),
ADD COLUMN IF NOT EXISTS last_completed_date DATE;

-- 2. Buat tabel untuk streak tracking
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_completed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS untuk user_streaks
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies untuk user_streaks (drop if exists first)
DROP POLICY IF EXISTS "Users can view own streak" ON public.user_streaks;
CREATE POLICY "Users can view own streak"
  ON public.user_streaks FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own streak" ON public.user_streaks;
CREATE POLICY "Users can insert own streak"
  ON public.user_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own streak" ON public.user_streaks;
CREATE POLICY "Users can update own streak"
  ON public.user_streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- 5. Create trigger untuk auto-update updated_at di user_streaks
DROP TRIGGER IF EXISTS update_user_streaks_updated_at ON public.user_streaks;
CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON public.user_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Create function untuk reset daily habits
CREATE OR REPLACE FUNCTION public.reset_daily_habits()
RETURNS void AS $$
BEGIN
  -- Reset status untuk daily habits yang sudah completed
  UPDATE public.habits
  SET 
    status = 'active',
    completed_at = NULL
  WHERE 
    recurring_type = 'daily' 
    AND status = 'completed'
    AND DATE(completed_at) < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function untuk reset weekly habits (setiap Senin)
CREATE OR REPLACE FUNCTION public.reset_weekly_habits()
RETURNS void AS $$
BEGIN
  -- Reset status untuk weekly habits yang sudah completed
  UPDATE public.habits
  SET 
    status = 'active',
    completed_at = NULL
  WHERE 
    recurring_type = 'weekly' 
    AND status = 'completed'
    AND DATE(completed_at) < DATE_TRUNC('week', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Untuk production, setup cron job di Supabase untuk menjalankan
-- reset_daily_habits() setiap hari dan reset_weekly_habits() setiap Senin
