-- Default data

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