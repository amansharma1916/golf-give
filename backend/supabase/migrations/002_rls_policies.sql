-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE charity_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE prize_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Public access to charities
CREATE POLICY "charities_select_public" ON charities
  FOR SELECT USING (is_active = TRUE);

-- Public access to draws (published only)
CREATE POLICY "draws_select_public" ON draws
  FOR SELECT USING (status = 'published');

-- Users can read their own data
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can read their own subscriptions
CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can read their own scores
CREATE POLICY "scores_select_own" ON scores
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own scores
CREATE POLICY "scores_insert_own" ON scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own scores
CREATE POLICY "scores_update_own" ON scores
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own scores
CREATE POLICY "scores_delete_own" ON scores
  FOR DELETE USING (auth.uid() = user_id);

-- Users can read their own payouts
CREATE POLICY "payouts_select_own" ON payouts
  FOR SELECT USING (auth.uid() = user_id);

-- Users can read their own charity contributions
CREATE POLICY "charity_contributions_select_own" ON charity_contributions
  FOR SELECT USING (auth.uid() = user_id);
