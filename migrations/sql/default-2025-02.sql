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
('Robovolt United', 'Electrica - Robotica');

-- Fixtures (Jornadas) for S2 2025
-- All matches are scheduled; timestamps are local dates at 18:00–21:00

-- Jornada 1 - 2025-08-22
INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'Minerham Forest'), (SELECT id FROM teams WHERE name = 'Robovolt United'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-08-22 18:00:00', 'scheduled');

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
((SELECT id FROM teams WHERE name = 'Robovolt United'), (SELECT id FROM teams WHERE name = 'Industrial FC'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-08-29 19:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'New Boys'), (SELECT id FROM teams WHERE name = 'Manchester Civil'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-08-29 20:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'Atletico Byte'), (SELECT id FROM teams WHERE name = 'Minerham Forest'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-08-29 21:00:00', 'scheduled');

-- Jornada 3 - 2025-09-05
INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'Atletico Byte'), (SELECT id FROM teams WHERE name = 'Naranja Mecanica'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-09-05 18:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'Manchester Civil'), (SELECT id FROM teams WHERE name = 'Industrial FC'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-09-05 19:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'Mathchester Science'), (SELECT id FROM teams WHERE name = 'Minerham Forest'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-09-05 20:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'New Boys'), (SELECT id FROM teams WHERE name = 'Robovolt United'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-09-05 21:00:00', 'scheduled');

-- Jornada 4 - 2025-09-12
INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'Industrial FC'), (SELECT id FROM teams WHERE name = 'Mathchester Science'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-09-12 18:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'New Boys'), (SELECT id FROM teams WHERE name = 'Atletico Byte'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-09-12 19:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'Manchester Civil'), (SELECT id FROM teams WHERE name = 'Minerham Forest'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-09-12 20:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'Robovolt United'), (SELECT id FROM teams WHERE name = 'Naranja Mecanica'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-09-12 21:00:00', 'scheduled');

-- Jornada 5 - 2025-09-26
INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'Naranja Mecanica'), (SELECT id FROM teams WHERE name = 'Industrial FC'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-09-26 18:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'Robovolt United'), (SELECT id FROM teams WHERE name = 'Mathchester Science'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-09-26 19:00:00', 'scheduled');

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
((SELECT id FROM teams WHERE name = 'Robovolt United'), (SELECT id FROM teams WHERE name = 'Atletico Byte'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-10-10 20:00:00', 'scheduled');

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
((SELECT id FROM teams WHERE name = 'Robovolt United'), (SELECT id FROM teams WHERE name = 'Manchester Civil'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-10-17 20:00:00', 'scheduled');

INSERT INTO matches (local_team_id, visitor_team_id, competition_id, timestamp, status)
VALUES
((SELECT id FROM teams WHERE name = 'Minerham Forest'), (SELECT id FROM teams WHERE name = 'Industrial FC'), (SELECT id FROM competitions WHERE year = 2025 AND semester = 2), '2025-10-17 21:00:00', 'scheduled');


