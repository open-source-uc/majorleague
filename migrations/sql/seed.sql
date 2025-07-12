-- Seed data for Major League Database
-- Simplified data for development and testing
-- Using INTEGER auto-generated IDs for internal tables

-- Profiles (Users) - Base table, no dependencies
-- These IDs are TEXT because they come from auth.osuc.dev
INSERT INTO profiles (id, username, email) VALUES 
('admin', 'admin', 'admin@osuc.dev'),
('user1', 'juanperez', 'juan.perez@uc.cl'),
('user2', 'maria_gonzalez', 'maria.gonzalez@uc.cl'),
('user3', 'carlos_smith', 'carlos.smith@uc.cl');

-- Competitions - Base table, no dependencies  
-- IDs are auto-generated INTEGER
INSERT INTO competitions (name, year, semester, start_date, end_date) VALUES 
('Major League 2025 - Primer Semestre', 2025, 1, '2025-03-01', '2025-07-31'),
('Major League 2024 - Segundo Semestre', 2024, 2, '2024-08-01', '2024-12-15');

-- Teams - Depends on profiles (captain_id)
-- IDs are auto-generated INTEGER, captain_id is TEXT from profiles
INSERT INTO teams (name, captain_id, major) VALUES 
('Minerham Forest', 'user1', 'Ingeniería'),
('Old Boys', 'user2', 'Medicina'),
('OSUC United', 'user3', 'Arquitectura');

-- Players - Depends on teams and profiles
-- IDs are auto-generated INTEGER
INSERT INTO players (team_id, profile_id, first_name, last_name, nickname, age, position) VALUES 
-- Minerham Forest players
(1, 'user1', 'Juan', 'Pérez', 'Juanito', 22, 'MID'),
(1, 'admin', 'Admin', 'User', 'Admin', 25, 'GK'),
-- Old Boys players  
(2, 'user2', 'María', 'González', 'Mari', 23, 'FWD'),
-- OSUC United players
(3, 'user3', 'Carlos', 'Smith', 'Charlie', 24, 'DEF');

-- Team Competition Records - Auto-created by trigger, then updated
-- The create_team_competition_record trigger auto-creates records for active competitions
-- We only need to update points and positions for existing data

-- Update points and positions for 2025 competition (auto-created by trigger)
UPDATE team_competitions SET points = 15, position = 1 WHERE team_id = 1 AND competition_id = 1;  -- Minerham Forest
UPDATE team_competitions SET points = 12, position = 2 WHERE team_id = 2 AND competition_id = 1;  -- Old Boys  
UPDATE team_competitions SET points = 9, position = 3 WHERE team_id = 3 AND competition_id = 1;   -- OSUC United

-- Insert historical 2024 competition data (not auto-created since it's past)
INSERT INTO team_competitions (team_id, competition_id, points, position) VALUES 
(2, 2, 18, 1),  -- Old Boys in 2024
(1, 2, 15, 2);  -- Minerham Forest in 2024

-- Matches - Depends on teams and competitions
-- IDs are auto-generated INTEGER
INSERT INTO matches (local_team_id, visitor_team_id, competition_id, date, timestamptz, location, local_score, visitor_score, status) VALUES 
-- 2025 matches
(1, 2, 1, '2025-03-15', '2025-03-15 17:00:00', 'Cancha UC', 2, 1, 'finished'),
(2, 3, 1, '2025-03-20', '2025-03-20 16:00:00', 'Cancha UC', 1, 3, 'finished'),
(1, 3, 1, '2025-04-10', '2025-04-10 18:00:00', 'Cancha UC', 0, 0, 'scheduled'),
-- 2024 matches (historical)
(2, 1, 2, '2024-09-15', '2024-09-15 16:00:00', 'Cancha UC', 2, 0, 'finished');

-- Events - Depends on matches and teams
-- IDs are auto-generated INTEGER
INSERT INTO events (match_id, team_id, type, minute, description) VALUES 
-- Match 1 events (Minerham vs Old Boys)
(1, 1, 'goal', 25, 'Gol de Juan Pérez'),
(1, 2, 'goal', 30, 'Gol de María González'),
(1, 1, 'goal', 75, 'Gol ganador de Admin User'),
-- Match 2 events (Old Boys vs OSUC United)
(2, 3, 'goal', 15, 'Gol de Carlos Smith'),
(2, 2, 'goal', 45, 'Gol de María González'),
(2, 3, 'goal', 60, 'Segundo gol de Carlos Smith'),
(2, 3, 'goal', 85, 'Gol de la victoria'),
-- Match 4 events (2024 historical)
(4, 2, 'goal', 20, 'Gol histórico de María González'),
(4, 2, 'goal', 55, 'Segundo gol histórico');

-- Event Players - Depends on events and players
-- IDs are auto-generated INTEGER
INSERT INTO event_players (event_id, player_id, role) VALUES 
-- Event 1 (Juan Pérez goal)
(1, 1, 'main'),
-- Event 2 (María González goal)
(2, 3, 'main'),
-- Event 3 (Admin User goal)
(3, 2, 'main'),
-- Event 4 (Carlos Smith goal)
(4, 4, 'main'),
-- Event 5 (María González second goal)
(5, 3, 'main'),
-- Event 6 (Carlos Smith second goal)
(6, 4, 'main');

-- Lineups - Depends on teams and matches
-- IDs are auto-generated INTEGER
INSERT INTO lineups (team_id, match_id, date, matrix) VALUES 
-- Match 1 lineups
(1, 1, '2025-03-15', '4-4-2'),
(2, 1, '2025-03-15', '4-3-3'),
-- Match 2 lineups
(2, 2, '2025-03-20', '4-4-2'),
(3, 2, '2025-03-20', '3-5-2');

-- Streams - Depends on matches
-- IDs are auto-generated INTEGER
INSERT INTO streams (match_id, type, platform, url, start_time, end_time, notes) VALUES 
(1, 'youtube', 'YouTube', 'https://youtube.com/watch?v=example1', '2025-03-15 16:45:00', '2025-03-15 18:30:00', 'Stream completo del partido'),
(2, 'youtube', 'YouTube', 'https://youtube.com/watch?v=example2', '2025-03-20 15:45:00', '2025-03-20 17:30:00', 'Stream completo del partido'),
(4, 'youtube', 'YouTube', 'https://youtube.com/watch?v=example3', '2024-09-15 15:45:00', '2024-09-15 17:30:00', 'Stream histórico');

-- Join Team Requests - Depends on teams and profiles
-- IDs are auto-generated INTEGER
-- Note: Avoiding 'approved' status to prevent trigger conflicts with existing players
INSERT INTO join_team_requests (team_id, profile_id, date, first_name, last_name, age, preferred_position, status, notes) VALUES 
(2, 'admin', '2025-03-01', 'Admin', 'User', 25, 'GK', 'pending', 'Solicitud pendiente - Admin quiere jugar en segundo equipo'),
(2, 'user1', '2025-03-05', 'Juan', 'Pérez', 22, 'DEF', 'pending', 'Solicitud pendiente - Juan quiere cambiar de equipo'),
(3, 'user2', '2025-03-10', 'María', 'González', 23, 'FWD', 'rejected', 'Solicitud rechazada - conflicto de horarios'),
(1, 'user3', '2025-03-12', 'Carlos', 'Smith', 24, 'MID', 'rejected', 'Solicitud rechazada - ya está en OSUC United');

-- User Preferences - Depends on profiles
-- IDs are auto-generated INTEGER
INSERT INTO preferences (profile_id, type, channel, lead_time_minutes, is_enabled) VALUES 
('user1', 'notification', 'email', 30, TRUE),
('user2', 'notification', 'push', 15, TRUE),
('user3', 'notification', 'email', 45, TRUE),
('admin', 'notification', 'push', 10, TRUE);

-- Notifications - Depends on profiles, matches, and preferences
-- IDs are auto-generated INTEGER
INSERT INTO notifications (profile_id, match_id, preference_id, sent_at, is_enabled, status, delivery_info) VALUES 
('user1', 1, 1, NULL, TRUE, 'pending', '{}'),
('user2', 1, 2, '2025-03-15 16:30:00', TRUE, 'sent', '{"push": "sent_successfully"}'),
('user3', 2, 3, '2025-03-20 15:15:00', TRUE, 'sent', '{"email": "delivered"}'),
('admin', 1, 4, '2025-03-15 16:45:00', TRUE, 'sent', '{"push": "delivered"}');

-- User Favorite Teams - Depends on profiles and teams
-- IDs are auto-generated INTEGER
INSERT INTO user_favorite_teams (profile_id, team_id) VALUES 
('user1', 1),    -- Juan likes Minerham Forest
('user2', 2),    -- María likes Old Boys
('user3', 3),    -- Carlos likes OSUC United
('admin', 1),    -- Admin likes Minerham Forest
('user1', 2),    -- Juan also likes Old Boys
('user2', 1);    -- María also likes Minerham Forest

-- User Favorite Matches - Depends on profiles and matches
-- IDs are auto-generated INTEGER
INSERT INTO user_favorite_matches (profile_id, match_id) VALUES 
('user1', 1),    -- Juan favorite match
('user2', 1),    -- María favorite match
('user3', 2),    -- Carlos favorite match
('admin', 1),    -- Admin favorite match
('user1', 4),    -- Juan likes historical match
('user2', 4);    -- María likes historical match