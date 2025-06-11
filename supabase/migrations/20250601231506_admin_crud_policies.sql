-- Admin CRUD policies for all public tables (int8 role, 1 = admin, optimized for performance)

-- Create a safe admin function that bypasses RLS for role checking
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Use auth.uid() directly and bypass RLS for this specific check
  RETURN (
    SELECT role = 1 
    FROM public.profiles 
    WHERE id = auth.uid()
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Teams
CREATE POLICY "Admins can select teams" ON public.teams FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert teams" ON public.teams FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update teams" ON public.teams FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete teams" ON public.teams FOR DELETE USING (public.is_admin());

-- Players
CREATE POLICY "Admins can select players" ON public.players FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert players" ON public.players FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update players" ON public.players FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete players" ON public.players FOR DELETE USING (public.is_admin());

-- Competitions
CREATE POLICY "Admins can select competitions" ON public.competitions FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert competitions" ON public.competitions FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update competitions" ON public.competitions FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete competitions" ON public.competitions FOR DELETE USING (public.is_admin());

-- Team Competitions
CREATE POLICY "Admins can select team_competitions" ON public.team_competitions FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert team_competitions" ON public.team_competitions FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update team_competitions" ON public.team_competitions FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete team_competitions" ON public.team_competitions FOR DELETE USING (public.is_admin());

-- Matches
CREATE POLICY "Admins can select matches" ON public.matches FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert matches" ON public.matches FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update matches" ON public.matches FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete matches" ON public.matches FOR DELETE USING (public.is_admin());

-- Streams
CREATE POLICY "Admins can select streams" ON public.streams FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert streams" ON public.streams FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update streams" ON public.streams FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete streams" ON public.streams FOR DELETE USING (public.is_admin());

-- Lineups
CREATE POLICY "Admins can select lineups" ON public.lineups FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert lineups" ON public.lineups FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update lineups" ON public.lineups FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete lineups" ON public.lineups FOR DELETE USING (public.is_admin());

-- Events
CREATE POLICY "Admins can select events" ON public.events FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert events" ON public.events FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update events" ON public.events FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete events" ON public.events FOR DELETE USING (public.is_admin());

-- Event Players
CREATE POLICY "Admins can select event_players" ON public.event_players FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert event_players" ON public.event_players FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update event_players" ON public.event_players FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete event_players" ON public.event_players FOR DELETE USING (public.is_admin());

-- Join Team Requests
CREATE POLICY "Admins can select join_team_requests" ON public.join_team_requests FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert join_team_requests" ON public.join_team_requests FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update join_team_requests" ON public.join_team_requests FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete join_team_requests" ON public.join_team_requests FOR DELETE USING (public.is_admin());

-- User Favorite Teams
CREATE POLICY "Admins can select user_favorite_teams" ON public.user_favorite_teams FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert user_favorite_teams" ON public.user_favorite_teams FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update user_favorite_teams" ON public.user_favorite_teams FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete user_favorite_teams" ON public.user_favorite_teams FOR DELETE USING (public.is_admin());

-- User Favorite Matches
CREATE POLICY "Admins can select user_favorite_matches" ON public.user_favorite_matches FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert user_favorite_matches" ON public.user_favorite_matches FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update user_favorite_matches" ON public.user_favorite_matches FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete user_favorite_matches" ON public.user_favorite_matches FOR DELETE USING (public.is_admin());

-- Preferences
CREATE POLICY "Admins can select preferences" ON public.preferences FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert preferences" ON public.preferences FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update preferences" ON public.preferences FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete preferences" ON public.preferences FOR DELETE USING (public.is_admin());

-- Notifications
CREATE POLICY "Admins can select notifications" ON public.notifications FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert notifications" ON public.notifications FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update notifications" ON public.notifications FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete notifications" ON public.notifications FOR DELETE USING (public.is_admin());

-- Profiles (admins can CRUD any profile) - Note: This doesn't conflict with basic policies since it's more specific
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING (public.is_admin());
