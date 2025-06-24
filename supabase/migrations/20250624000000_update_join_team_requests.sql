-- Update join_team_requests table
ALTER TABLE join_team_requests
  -- Remove first_name and last_name
  DROP COLUMN IF EXISTS first_name,
  DROP COLUMN IF EXISTS last_name,
  -- Make profile_id required
  ALTER COLUMN profile_id SET NOT NULL,
  -- Add major and gen columns
  ADD COLUMN IF NOT EXISTS major VARCHAR,
  ADD COLUMN IF NOT EXISTS gen VARCHAR;

-- Update RLS policies to reflect the new structure
BEGIN;
  DROP POLICY IF EXISTS "Users can create join_team_requests for themselves" ON join_team_requests;
  CREATE POLICY "Users can create join_team_requests for themselves" 
    ON join_team_requests 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = profile_id);
COMMIT; 