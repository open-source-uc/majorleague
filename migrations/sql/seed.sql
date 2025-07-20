-- Seed data for Major League Database
-- Simplified version using natural insertion flow with triggers
-- 2 teams, 2 matches, 2 players, 1 user

-- 1. PROFILES - Base users
INSERT INTO profiles (id, username, email) VALUES 
('admin', 'admin', 'admin@osuc.dev'),
('player1', 'player1', 'player1@uc.cl'),
('player2', 'player2', 'player2@uc.cl');

-- 2. COMPETITIONS - Single competition
INSERT INTO competitions (name, year, semester, start_date, end_date) VALUES 
('Major League 2025', 2025, 1, '2025-03-01', '2025-07-31');

-- 3. TEAMS - Two teams
-- TRIGGER: create_team_competition_record will auto-create team_competitions records
INSERT INTO teams (name, captain_id, major) VALUES 
('Minerham Forest', 'player1', 'Ingeniería'),
('Old Boys', 'player2', 'Medicina');

-- 4. JOIN_TEAM_REQUESTS - Natural workflow: create pending requests
INSERT INTO join_team_requests (team_id, profile_id, date, first_name, last_name, age, preferred_position, status, notes) VALUES 
(1, 'player1', '2025-02-15', 'Juan', 'Pérez', 22, 'MID', 'pending', 'Solicitud para unirse a Minerham Forest'),
(2, 'player2', '2025-02-16', 'María', 'González', 23, 'FWD', 'pending', 'Solicitud para unirse a Old Boys');

-- 5. APPROVE REQUESTS - Natural workflow: approve requests
-- TRIGGER: create_player_on_approval will auto-create players records
UPDATE join_team_requests 
SET status = 'approved' 
WHERE id IN (1, 2);

-- 6. MATCHES - Two matches between the teams, created with 'in review' status
INSERT INTO matches (local_team_id, visitor_team_id, competition_id, date, timestamptz, location, local_score, visitor_score, status) VALUES 
(1, 2, 1, '2025-03-15', '2025-03-15 17:00:00', 'Cancha UC', 0, 0, 'in review'),
(2, 1, 1, '2025-03-20', '2025-03-20 16:00:00', 'Cancha UC', 0, 0, 'in review');

-- 7. EVENTS - Add some goals to both matches
-- TRIGGER: update_match_scores_on_goal_insert will auto-update match scores
INSERT INTO events (match_id, team_id, type, minute, description) VALUES 
-- Match 1: Minerham Forest (1) vs Old Boys (2) - Result: 2-1
(1, 1, 'goal', 25, 'Gol de Juan Pérez'),
(1, 2, 'goal', 30, 'Gol de María González'),
(1, 1, 'goal', 75, 'Gol ganador de Juan Pérez'),
-- Match 2: Old Boys (2) vs Minerham Forest (1) - Result: 1-2
(2, 2, 'goal', 20, 'Gol de María González'),
(2, 1, 'goal', 60, 'Gol de Juan Pérez'),
(2, 1, 'goal', 85, 'Gol ganador de Juan Pérez');

-- 8. FINISH MATCHES - Change status to finished
-- TRIGGER: update_competition_points will auto-calculate team_competitions points & positions
UPDATE matches 
SET status = 'finished' 
WHERE id IN (1, 2);

-- 9. BASIC PREFERENCES
INSERT INTO preferences (profile_id, type, channel, lead_time_minutes, is_enabled) VALUES 
('admin', 'notification', 'push', 10, TRUE),
('player1', 'notification', 'email', 30, TRUE),
('player2', 'notification', 'push', 15, TRUE);

-- 10. USER FAVORITE TEAMS
INSERT INTO user_favorite_teams (profile_id, team_id) VALUES 
('admin', 1),    -- Admin likes Minerham Forest
('player1', 1),  -- Player1 (Juan) likes his own team
('player2', 2);  -- Player2 (María) likes her own team