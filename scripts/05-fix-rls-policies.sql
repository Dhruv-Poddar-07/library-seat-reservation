-- Disable RLS on reservation_history since it's an audit table written by the server
-- The service role client will handle all writes to this table

ALTER TABLE reservation_history DISABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own history
CREATE POLICY "Users can view their own history" ON reservation_history
  FOR SELECT USING (auth.uid() = user_id);

-- Allow admins to view all history
CREATE POLICY "Admins can view all history" ON reservation_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );
