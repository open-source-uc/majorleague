-- Default data for Segundo Semestre 2025 (S2 2025)

-- Base data (competitions and teams)
DELETE FROM competitions;
DELETE FROM teams;

INSERT INTO competitions (name, year, semester, start_timestamp, end_timestamp) VALUES 
('Segundo Semestre 2025', 2025, 2, '2025-08-01 00:00:00', '2025-12-31 23:59:59');

INSERT INTO teams (name, major) VALUES 
('Atletico Byte', 'Computacion - Software'),
('Industrial FC', 'Investigación Operativa'),
('Manchester Civil', 'Civil - Transporte - Construccion'),
('Mathchester Science', 'Química - Física - Matematica Biomedica - Biologia'),
('Minerham Forest', 'Mineria - Ambiental - Hidraulica - Geociencias'),
('Naranja Mecanica', 'Mecanica - Diseño e Innovación (IDI)'),
('New Boys', 'Novatos'),
('AC Robovolt', 'Electrica - Robotica');

-- Fixtures (Jornadas) for S2 2025
-- All matches are scheduled; timestamps are local dates at 18:00–21:00

-- Jornada 1 - 2025-08-22
INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'AC Robovolt'), (SELECT id FROM teams WHERE name = 'Minerham Forest'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-08-22 18:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'Industrial FC'), (SELECT id FROM teams WHERE name = 'Atletico Byte'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-08-22 19:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'New Boys'), (SELECT id FROM teams WHERE name = 'Mathchester Science'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-08-22 20:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'Manchester Civil'), (SELECT id FROM teams WHERE name = 'Naranja Mecanica'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-08-22 21:00:00', 'scheduled');

-- Jornada 2 - 2025-08-29
INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'Naranja Mecanica'), (SELECT id FROM teams WHERE name = 'Mathchester Science'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-08-29 18:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'Industrial FC'), (SELECT id FROM teams WHERE name = 'AC Robovolt'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-08-29 19:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'Manchester Civil'), (SELECT id FROM teams WHERE name = 'New Boys'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-08-29 20:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'Minerham Forest'), (SELECT id FROM teams WHERE name = 'Atletico Byte'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-08-29 21:00:00', 'scheduled');

-- Jornada 3 - 2025-09-05
INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'Mathchester Science'), (SELECT id FROM teams WHERE name = 'Minerham Forest'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-09-05 18:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'Industrial FC'), (SELECT id FROM teams WHERE name = 'Manchester Civil'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-09-05 19:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'AC Robovolt'), (SELECT id FROM teams WHERE name = 'New Boys'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-09-05 20:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'Atletico Byte'), (SELECT id FROM teams WHERE name = 'Naranja Mecanica'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-09-05 21:00:00', 'scheduled');

-- Jornada 4 - 2025-09-12
INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'AC Robovolt'), (SELECT id FROM teams WHERE name = 'Naranja Mecanica'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-09-12 18:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'New Boys'), (SELECT id FROM teams WHERE name = 'Atletico Byte'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-09-12 19:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'Minerham Forest'), (SELECT id FROM teams WHERE name = 'Manchester Civil'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-09-12 20:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'Industrial FC'), (SELECT id FROM teams WHERE name = 'Mathchester Science'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-09-12 21:00:00', 'scheduled');

-- Jornada 5 - 2025-09-26
INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'Naranja Mecanica'), (SELECT id FROM teams WHERE name = 'Industrial FC'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-09-26 18:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'AC Robovolt'), (SELECT id FROM teams WHERE name = 'Mathchester Science'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-09-26 19:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'New Boys'), (SELECT id FROM teams WHERE name = 'Minerham Forest'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-09-26 20:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'Atletico Byte'), (SELECT id FROM teams WHERE name = 'Manchester Civil'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-09-26 21:00:00', 'scheduled');

-- Jornada 6 - 2025-10-10
INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'New Boys'), (SELECT id FROM teams WHERE name = 'Industrial FC'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-10-10 18:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'Naranja Mecanica'), (SELECT id FROM teams WHERE name = 'Minerham Forest'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-10-10 19:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'AC Robovolt'), (SELECT id FROM teams WHERE name = 'Atletico Byte'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-10-10 20:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'Mathchester Science'), (SELECT id FROM teams WHERE name = 'Manchester Civil'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-10-10 21:00:00', 'scheduled');

-- Jornada 7 - 2025-10-17
INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'New Boys'), (SELECT id FROM teams WHERE name = 'Naranja Mecanica'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-10-17 18:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'Mathchester Science'), (SELECT id FROM teams WHERE name = 'Atletico Byte'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-10-17 19:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'AC Robovolt'), (SELECT id FROM teams WHERE name = 'Manchester Civil'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-10-17 20:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'Minerham Forest'), (SELECT id FROM teams WHERE name = 'Industrial FC'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-10-17 21:00:00', 'scheduled');



-- Results and Events (seeded from official IG images) up to 2025-09-12
-- Notes:
-- - Goals are recorded as generic 'goal' events without player linkage
-- - Results extracted from official Instagram posts and table images
-- - Only official league matches between the 8 registered teams are included

-- Jornada 1 (2025-08-22) - From IG images
-- AC Robovolt 0 - 4 Minerham Forest (18:00) - Corrected score from official IG post
INSERT INTO events (match_id, team_id, type, minute, description)
VALUES 
((SELECT id FROM matches WHERE timestamp = '2025-08-22 18:00:00'), (SELECT id FROM teams WHERE name = 'Minerham Forest'), 'goal', 15, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-08-22 18:00:00'), (SELECT id FROM teams WHERE name = 'Minerham Forest'), 'goal', 32, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-08-22 18:00:00'), (SELECT id FROM teams WHERE name = 'Minerham Forest'), 'goal', 54, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-08-22 18:00:00'), (SELECT id FROM teams WHERE name = 'Minerham Forest'), 'goal', 78, 'Seed: IG images');
UPDATE matches SET status = 'finished' WHERE timestamp = '2025-08-22 18:00:00';

-- Industrial FC 0 - 1 Atletico Byte (19:00)
INSERT INTO events (match_id, team_id, type, minute, description)
VALUES ((SELECT id FROM matches WHERE timestamp = '2025-08-22 19:00:00'), (SELECT id FROM teams WHERE name = 'Atletico Byte'), 'goal', 67, 'Seed: IG images');
UPDATE matches SET status = 'finished' WHERE timestamp = '2025-08-22 19:00:00';

-- New Boys 1 - 2 Mathchester Science (20:00)
INSERT INTO events (match_id, team_id, type, minute, description)
VALUES 
((SELECT id FROM matches WHERE timestamp = '2025-08-22 20:00:00'), (SELECT id FROM teams WHERE name = 'New Boys'), 'goal', 25, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-08-22 20:00:00'), (SELECT id FROM teams WHERE name = 'Mathchester Science'), 'goal', 41, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-08-22 20:00:00'), (SELECT id FROM teams WHERE name = 'Mathchester Science'), 'goal', 76, 'Seed: IG images');
UPDATE matches SET status = 'finished' WHERE timestamp = '2025-08-22 20:00:00';

-- Manchester Civil 1 - 1 Naranja Mecanica (21:00)
INSERT INTO events (match_id, team_id, type, minute, description)
VALUES 
((SELECT id FROM matches WHERE timestamp = '2025-08-22 21:00:00'), (SELECT id FROM teams WHERE name = 'Manchester Civil'), 'goal', 38, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-08-22 21:00:00'), (SELECT id FROM teams WHERE name = 'Naranja Mecanica'), 'goal', 82, 'Seed: IG images');
UPDATE matches SET status = 'finished' WHERE timestamp = '2025-08-22 21:00:00';

-- Jornada 2 (2025-08-29) - From IG images
-- Naranja Mecanica 2 - 1 Mathchester Science (18:00) - Corrected opponent from IG posts
INSERT INTO events (match_id, team_id, type, minute, description)
VALUES 
((SELECT id FROM matches WHERE timestamp = '2025-08-29 18:00:00'), (SELECT id FROM teams WHERE name = 'Naranja Mecanica'), 'goal', 22, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-08-29 18:00:00'), (SELECT id FROM teams WHERE name = 'Naranja Mecanica'), 'goal', 35, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-08-29 18:00:00'), (SELECT id FROM teams WHERE name = 'Mathchester Science'), 'goal', 58, 'Seed: IG images');
UPDATE matches SET status = 'finished' WHERE timestamp = '2025-08-29 18:00:00';

-- Industrial FC 3 - 0 AC Robovolt (19:00) - From IG images
INSERT INTO events (match_id, team_id, type, minute, description)
VALUES 
((SELECT id FROM matches WHERE timestamp = '2025-08-29 19:00:00'), (SELECT id FROM teams WHERE name = 'Industrial FC'), 'goal', 18, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-08-29 19:00:00'), (SELECT id FROM teams WHERE name = 'Industrial FC'), 'goal', 52, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-08-29 19:00:00'), (SELECT id FROM teams WHERE name = 'Industrial FC'), 'goal', 79, 'Seed: IG images');
UPDATE matches SET status = 'finished' WHERE timestamp = '2025-08-29 19:00:00';

-- Manchester Civil 2 - 1 New Boys (20:00) - From IG images
INSERT INTO events (match_id, team_id, type, minute, description)
VALUES 
((SELECT id FROM matches WHERE timestamp = '2025-08-29 20:00:00'), (SELECT id FROM teams WHERE name = 'Manchester Civil'), 'goal', 28, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-08-29 20:00:00'), (SELECT id FROM teams WHERE name = 'New Boys'), 'goal', 58, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-08-29 20:00:00'), (SELECT id FROM teams WHERE name = 'Manchester Civil'), 'goal', 83, 'Seed: IG images');
UPDATE matches SET status = 'finished' WHERE timestamp = '2025-08-29 20:00:00';

-- Minerham Forest 4 - 0 Atletico Byte (21:00) - From IG images
INSERT INTO events (match_id, team_id, type, minute, description)
VALUES 
((SELECT id FROM matches WHERE timestamp = '2025-08-29 21:00:00'), (SELECT id FROM teams WHERE name = 'Minerham Forest'), 'goal', 11, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-08-29 21:00:00'), (SELECT id FROM teams WHERE name = 'Minerham Forest'), 'goal', 37, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-08-29 21:00:00'), (SELECT id FROM teams WHERE name = 'Minerham Forest'), 'goal', 63, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-08-29 21:00:00'), (SELECT id FROM teams WHERE name = 'Minerham Forest'), 'goal', 86, 'Seed: IG images');
UPDATE matches SET status = 'finished' WHERE timestamp = '2025-08-29 21:00:00';

-- Jornada 3 (2025-09-05) - From IG images
-- Mathchester Science 1 - 1 Minerham Forest (18:00) - From IG image
INSERT INTO events (match_id, team_id, type, minute, description)
VALUES 
((SELECT id FROM matches WHERE timestamp = '2025-09-05 18:00:00'), (SELECT id FROM teams WHERE name = 'Mathchester Science'), 'goal', 29, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-09-05 18:00:00'), (SELECT id FROM teams WHERE name = 'Minerham Forest'), 'goal', 72, 'Seed: IG images');
UPDATE matches SET status = 'finished' WHERE timestamp = '2025-09-05 18:00:00';

-- Industrial FC 4 - 0 Manchester Civil (19:00) - From IG images
INSERT INTO events (match_id, team_id, type, minute, description)
VALUES 
((SELECT id FROM matches WHERE timestamp = '2025-09-05 19:00:00'), (SELECT id FROM teams WHERE name = 'Industrial FC'), 'goal', 18, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-09-05 19:00:00'), (SELECT id FROM teams WHERE name = 'Industrial FC'), 'goal', 41, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-09-05 19:00:00'), (SELECT id FROM teams WHERE name = 'Industrial FC'), 'goal', 66, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-09-05 19:00:00'), (SELECT id FROM teams WHERE name = 'Industrial FC'), 'goal', 83, 'Seed: IG images');
UPDATE matches SET status = 'finished' WHERE timestamp = '2025-09-05 19:00:00';

-- AC Robovolt 0 - 0 New Boys (20:00) - From IG images (corrected fixture)
UPDATE matches SET status = 'finished' WHERE timestamp = '2025-09-05 20:00:00';

-- Atletico Byte 2 - 2 Naranja Mecanica (21:00) - From IG images
INSERT INTO events (match_id, team_id, type, minute, description)
VALUES 
((SELECT id FROM matches WHERE timestamp = '2025-09-05 21:00:00'), (SELECT id FROM teams WHERE name = 'Atletico Byte'), 'goal', 22, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-09-05 21:00:00'), (SELECT id FROM teams WHERE name = 'Atletico Byte'), 'goal', 57, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-09-05 21:00:00'), (SELECT id FROM teams WHERE name = 'Naranja Mecanica'), 'goal', 39, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-09-05 21:00:00'), (SELECT id FROM teams WHERE name = 'Naranja Mecanica'), 'goal', 74, 'Seed: IG images');
UPDATE matches SET status = 'finished' WHERE timestamp = '2025-09-05 21:00:00';

-- Jornada 4 (2025-09-12) - From IG images
-- AC Robovolt 2 - 0 Naranja Mecanica (18:00) - From IG image showing ACR victory
INSERT INTO events (match_id, team_id, type, minute, description)
VALUES 
((SELECT id FROM matches WHERE timestamp = '2025-09-12 18:00:00'), (SELECT id FROM teams WHERE name = 'AC Robovolt'), 'goal', 24, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-09-12 18:00:00'), (SELECT id FROM teams WHERE name = 'AC Robovolt'), 'goal', 68, 'Seed: IG images');
UPDATE matches SET status = 'finished' WHERE timestamp = '2025-09-12 18:00:00';

-- New Boys 4 - 0 Atletico Byte (19:00) - From IG images
INSERT INTO events (match_id, team_id, type, minute, description)
VALUES 
((SELECT id FROM matches WHERE timestamp = '2025-09-12 19:00:00'), (SELECT id FROM teams WHERE name = 'New Boys'), 'goal', 12, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-09-12 19:00:00'), (SELECT id FROM teams WHERE name = 'New Boys'), 'goal', 36, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-09-12 19:00:00'), (SELECT id FROM teams WHERE name = 'New Boys'), 'goal', 61, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-09-12 19:00:00'), (SELECT id FROM teams WHERE name = 'New Boys'), 'goal', 84, 'Seed: IG images');
UPDATE matches SET status = 'finished' WHERE timestamp = '2025-09-12 19:00:00';

-- Minerham Forest 0 - 0 Manchester Civil (20:00) - From IG images
UPDATE matches SET status = 'finished' WHERE timestamp = '2025-09-12 20:00:00';

-- Industrial FC 2 - 2 Mathchester Science (21:00) - From IG images
INSERT INTO events (match_id, team_id, type, minute, description)
VALUES 
((SELECT id FROM matches WHERE timestamp = '2025-09-12 21:00:00'), (SELECT id FROM teams WHERE name = 'Industrial FC'), 'goal', 24, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-09-12 21:00:00'), (SELECT id FROM teams WHERE name = 'Industrial FC'), 'goal', 68, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-09-12 21:00:00'), (SELECT id FROM teams WHERE name = 'Mathchester Science'), 'goal', 47, 'Seed: IG images'),
((SELECT id FROM matches WHERE timestamp = '2025-09-12 21:00:00'), (SELECT id FROM teams WHERE name = 'Mathchester Science'), 'goal', 89, 'Seed: IG images');
UPDATE matches SET status = 'finished' WHERE timestamp = '2025-09-12 21:00:00';

