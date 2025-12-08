-- Migration v2: Mood Tracker, Timer, dan Edit features
-- Jalankan ini setelah migration v1

-- 1. Tambah kolom timer ke habits
ALTER TABLE public.habits 
ADD COLUMN IF NOT EXISTS timer_duration INTEGER,
ADD COLUMN IF NOT EXISTS timer_started_at TIMESTAMP WITH TIME ZONE;

-- 2. Buat tabel untuk mood tracking
CREATE TABLE IF NOT EXISTS public.daily_moods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mood TEXT NOT NULL CHECK (mood IN ('great', 'good', 'okay', 'bad', 'terrible')),
  note TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 3. Enable RLS untuk daily_moods
ALTER TABLE public.daily_moods ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies untuk daily_moods
DROP POLICY IF EXISTS "Users can view own moods" ON public.daily_moods;
CREATE POLICY "Users can view own moods"
  ON public.daily_moods FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own moods" ON public.daily_moods;
CREATE POLICY "Users can insert own moods"
  ON public.daily_moods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own moods" ON public.daily_moods;
CREATE POLICY "Users can update own moods"
  ON public.daily_moods FOR UPDATE
  USING (auth.uid() = user_id);

-- 5. Create index untuk performa
CREATE INDEX IF NOT EXISTS daily_moods_user_date_idx ON public.daily_moods(user_id, date);
CREATE INDEX IF NOT EXISTS habits_timer_idx ON public.habits(timer_started_at) WHERE timer_started_at IS NOT NULL;

-- 6. Create function untuk get category statistics
CREATE OR REPLACE FUNCTION public.get_category_stats(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  category TEXT,
  count BIGINT,
  percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.category,
    COUNT(*) as count,
    ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER ()), 2) as percentage
  FROM public.habits h
  WHERE 
    h.user_id = p_user_id
    AND h.status = 'completed'
    AND h.completed_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY h.category
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
