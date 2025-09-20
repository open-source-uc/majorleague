PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE profiles (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    is_admin BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO profiles VALUES('111','VicenteRenasco','vrenasco@uc.cl',0,'2025-08-21 19:20:52','2025-08-21 19:20:52');
INSERT INTO profiles VALUES('289','Andrés Mella','andres.mella@estudiante.uc.cl',0,'2025-08-21 19:30:11','2025-08-21 19:30:11');
INSERT INTO profiles VALUES('293','Myllaray','myllaray.montoya@uc.cl',0,'2025-08-21 19:31:34','2025-08-21 19:31:34');
INSERT INTO profiles VALUES('2','Pablo Cruzval','p.cruzat.valenzuela@estudiante.uc.cl',0,'2025-08-22 17:50:50','2025-08-22 17:50:50');
INSERT INTO profiles VALUES('294','Sebastián Montenegro','slmontenegro@uc.cl',0,'2025-08-22 20:40:14','2025-08-22 20:40:14');
INSERT INTO profiles VALUES('29','Turbus','turbus@uc.cl',0,'2025-09-17 06:09:46','2025-09-17 06:09:46');
CREATE TABLE join_team_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER NOT NULL,
    profile_id TEXT NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    nickname TEXT,
    birthday DATE NOT NULL,
    preferred_position TEXT CHECK (preferred_position IN ('GK', 'DEF', 'MID', 'FWD')),
    preferred_jersey_number INTEGER,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);
INSERT INTO join_team_requests VALUES(4,5,'294','2025-08-22 21:13:01','Sebastián','Montenegro','Seba','2002-04-16','DEF',11,'pending',NULL,'2025-08-22 21:13:01','2025-08-22 21:13:01');
INSERT INTO join_team_requests VALUES(6,1,'289','2025-08-28 19:49:00','Andrés','Mella',NULL,'2005-01-01','MID',6,'pending',NULL,'2025-08-28 19:49:00','2025-08-28 19:49:00');
CREATE TABLE competitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    year INTEGER NOT NULL,
    semester INTEGER NOT NULL CHECK (semester IN (1, 2)),
    start_timestamp DATETIME NOT NULL,
    end_timestamp DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year, semester)
);
INSERT INTO competitions VALUES(1,'Segundo Semestre 2025',2025,2,'2025-08-01 00:00:00','2025-12-31 23:59:59','2025-08-22 05:03:05');
CREATE TABLE teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    captain_id TEXT,
    major TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (captain_id) REFERENCES profiles(id) ON DELETE RESTRICT
);
INSERT INTO teams VALUES(1,'Atletico Byte',NULL,'Computacion - Software','2025-08-22 05:03:05','2025-08-22 05:03:05');
INSERT INTO teams VALUES(2,'Industrial FC',NULL,'Investigación Operativa','2025-08-22 05:03:05','2025-08-22 05:03:05');
INSERT INTO teams VALUES(3,'Manchester Civil',NULL,'Civil - Transporte - Construccion','2025-08-22 05:03:05','2025-08-22 05:03:05');
INSERT INTO teams VALUES(4,'Mathchester Science',NULL,'Química - Física - Matematica Biomedica - Biologia','2025-08-22 05:03:05','2025-08-22 05:03:05');
INSERT INTO teams VALUES(5,'Minerham Forest',NULL,'Mineria - Ambiental - Hidraulica - Geociencias','2025-08-22 05:03:05','2025-08-22 05:03:05');
INSERT INTO teams VALUES(6,'Naranja Mecanica',NULL,'Mecanica - Diseño e Innovación (IDI)','2025-08-22 05:03:05','2025-08-22 05:03:05');
INSERT INTO teams VALUES(7,'New Boys',NULL,'Novatos','2025-08-22 05:03:05','2025-08-22 05:03:05');
INSERT INTO teams VALUES(8,'Robovolt United',NULL,'Electrica - Robotica','2025-08-22 05:03:05','2025-08-22 05:03:05');
CREATE TABLE players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER,
    profile_id TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    nickname TEXT,
    birthday DATE NOT NULL,
    position TEXT CHECK (position IN ('GK', 'DEF', 'MID', 'FWD')),
    jersey_number INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    UNIQUE(profile_id) -- One player record per profile
);
CREATE TABLE team_competitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER NOT NULL,
    competition_id INTEGER NOT NULL,
    points INTEGER DEFAULT 0,
    position INTEGER,
    pj INTEGER DEFAULT 0,  -- Partidos Jugados (Played Games)
    g INTEGER DEFAULT 0,   -- Ganados (Wins)
    e INTEGER DEFAULT 0,   -- Empatados (Draws)
    p INTEGER DEFAULT 0,   -- Perdidos (Losses)
    gf INTEGER DEFAULT 0,  -- Goles a Favor (Goals For)
    gc INTEGER DEFAULT 0,  -- Goles en Contra (Goals Against)
    dg INTEGER DEFAULT 0,  -- Diferencia de Goles (Goal Difference)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
    UNIQUE(team_id, competition_id)
);
INSERT INTO team_competitions VALUES(1,1,1,3,2,1,1,0,0,1,0,1,'2025-08-22 05:03:05');
INSERT INTO team_competitions VALUES(2,2,1,0,6,1,0,0,1,0,1,-1,'2025-08-22 05:03:05');
INSERT INTO team_competitions VALUES(3,3,1,1,4,1,0,1,0,1,1,0,'2025-08-22 05:03:05');
INSERT INTO team_competitions VALUES(4,4,1,3,2,1,1,0,0,2,1,1,'2025-08-22 05:03:05');
INSERT INTO team_competitions VALUES(5,5,1,3,1,1,1,0,0,4,0,4,'2025-08-22 05:03:05');
INSERT INTO team_competitions VALUES(6,6,1,1,4,1,0,1,0,1,1,0,'2025-08-22 05:03:05');
INSERT INTO team_competitions VALUES(7,7,1,0,6,1,0,0,1,1,2,-1,'2025-08-22 05:03:05');
INSERT INTO team_competitions VALUES(8,8,1,0,8,1,0,0,1,0,4,-4,'2025-08-22 05:03:05');
CREATE TABLE matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    local_team_id INTEGER NOT NULL,
    visitor_team_id INTEGER NOT NULL,
    competition_id INTEGER NOT NULL,
    timestamp DATETIME NOT NULL,
    location TEXT,
    local_score INTEGER DEFAULT 0,
    visitor_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'admin_review', 'finished', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (local_team_id) REFERENCES teams(id) ON DELETE RESTRICT,
    FOREIGN KEY (visitor_team_id) REFERENCES teams(id) ON DELETE RESTRICT,
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
    CHECK (local_team_id != visitor_team_id)
);
INSERT INTO matches VALUES(1,5,8,1,'2025-08-22 18:00:00',NULL,4,0,'finished','2025-08-22 05:03:05','2025-08-24 21:49:08');
INSERT INTO matches VALUES(2,2,1,1,'2025-08-22 19:00:00',NULL,0,1,'finished','2025-08-22 05:03:05','2025-08-24 21:49:15');
INSERT INTO matches VALUES(3,7,4,1,'2025-08-22 20:00:00',NULL,1,2,'finished','2025-08-22 05:03:05','2025-08-24 21:49:21');
INSERT INTO matches VALUES(4,3,6,1,'2025-08-22 21:00:00',NULL,1,1,'finished','2025-08-22 05:03:05','2025-08-24 21:49:29');
INSERT INTO matches VALUES(5,6,4,1,'2025-08-29 18:00:00',NULL,0,0,'admin_review','2025-08-22 05:03:05','2025-09-06 19:52:51');
INSERT INTO matches VALUES(6,8,2,1,'2025-08-29 19:00:00',NULL,0,0,'admin_review','2025-08-22 05:03:05','2025-09-06 19:53:01');
INSERT INTO matches VALUES(7,7,3,1,'2025-08-29 20:00:00',NULL,0,0,'admin_review','2025-08-22 05:03:05','2025-09-06 19:53:07');
INSERT INTO matches VALUES(8,1,5,1,'2025-08-29 21:00:00',NULL,0,0,'admin_review','2025-08-22 05:03:05','2025-09-06 19:53:15');
INSERT INTO matches VALUES(9,1,6,1,'2025-09-05 18:00:00',NULL,0,0,'admin_review','2025-08-22 05:03:05','2025-09-06 19:53:21');
INSERT INTO matches VALUES(10,3,2,1,'2025-09-05 19:00:00',NULL,0,0,'admin_review','2025-08-22 05:03:05','2025-09-06 19:53:27');
INSERT INTO matches VALUES(11,4,5,1,'2025-09-05 20:00:00',NULL,0,0,'admin_review','2025-08-22 05:03:05','2025-09-06 19:53:32');
INSERT INTO matches VALUES(12,7,8,1,'2025-09-05 21:00:00',NULL,0,0,'admin_review','2025-08-22 05:03:05','2025-09-06 19:53:38');
INSERT INTO matches VALUES(13,2,4,1,'2025-09-12 18:00:00',NULL,0,0,'live','2025-08-22 05:03:05','2025-09-12 21:32:12');
INSERT INTO matches VALUES(14,7,1,1,'2025-09-12 19:00:00',NULL,0,0,'live','2025-08-22 05:03:05','2025-09-12 22:55:10');
INSERT INTO matches VALUES(15,3,5,1,'2025-09-12 20:00:00',NULL,0,0,'live','2025-08-22 05:03:05','2025-09-12 23:19:05');
INSERT INTO matches VALUES(16,8,6,1,'2025-09-12 21:00:00',NULL,0,0,'scheduled','2025-08-22 05:03:05','2025-08-22 05:03:05');
INSERT INTO matches VALUES(17,6,2,1,'2025-09-26 18:00:00',NULL,0,0,'scheduled','2025-08-22 05:03:05','2025-08-22 05:03:05');
INSERT INTO matches VALUES(18,8,4,1,'2025-09-26 19:00:00',NULL,0,0,'scheduled','2025-08-22 05:03:05','2025-08-22 05:03:05');
INSERT INTO matches VALUES(19,7,5,1,'2025-09-26 20:00:00',NULL,0,0,'scheduled','2025-08-22 05:03:05','2025-08-22 05:03:05');
INSERT INTO matches VALUES(20,1,3,1,'2025-09-26 21:00:00',NULL,0,0,'scheduled','2025-08-22 05:03:05','2025-08-22 05:03:05');
INSERT INTO matches VALUES(21,7,2,1,'2025-10-10 18:00:00',NULL,0,0,'scheduled','2025-08-22 05:03:05','2025-08-22 05:03:05');
INSERT INTO matches VALUES(22,6,5,1,'2025-10-10 19:00:00',NULL,0,0,'scheduled','2025-08-22 05:03:05','2025-08-22 05:03:05');
INSERT INTO matches VALUES(23,8,1,1,'2025-10-10 20:00:00',NULL,0,0,'scheduled','2025-08-22 05:03:05','2025-08-22 05:03:05');
INSERT INTO matches VALUES(24,4,3,1,'2025-10-10 21:00:00',NULL,0,0,'scheduled','2025-08-22 05:03:05','2025-08-22 05:03:05');
INSERT INTO matches VALUES(25,7,6,1,'2025-10-17 18:00:00',NULL,0,0,'scheduled','2025-08-22 05:03:05','2025-08-22 05:03:05');
INSERT INTO matches VALUES(26,4,1,1,'2025-10-17 19:00:00',NULL,0,0,'scheduled','2025-08-22 05:03:05','2025-08-22 05:03:05');
INSERT INTO matches VALUES(27,8,3,1,'2025-10-17 20:00:00',NULL,0,0,'scheduled','2025-08-22 05:03:05','2025-08-22 05:03:05');
INSERT INTO matches VALUES(28,5,2,1,'2025-10-17 21:00:00',NULL,0,0,'scheduled','2025-08-22 05:03:05','2025-08-22 05:03:05');
CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('goal', 'yellow_card', 'red_card', 'substitution', 'other')),
    minute INTEGER NOT NULL CHECK (minute >= 0 AND minute <= 120),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);
INSERT INTO events VALUES(1,1,5,'goal',20,NULL,'2025-08-24 21:43:49');
INSERT INTO events VALUES(2,1,5,'goal',28,NULL,'2025-08-24 21:44:08');
INSERT INTO events VALUES(3,1,5,'goal',30,NULL,'2025-08-24 21:45:19');
INSERT INTO events VALUES(4,1,5,'goal',65,NULL,'2025-08-24 21:45:37');
INSERT INTO events VALUES(5,2,1,'goal',24,NULL,'2025-08-24 21:46:25');
INSERT INTO events VALUES(6,3,7,'goal',1,NULL,'2025-08-24 21:47:15');
INSERT INTO events VALUES(7,3,4,'goal',2,NULL,'2025-08-24 21:47:51');
INSERT INTO events VALUES(8,3,4,'goal',3,NULL,'2025-08-24 21:48:09');
INSERT INTO events VALUES(9,4,3,'goal',1,NULL,'2025-08-24 21:48:31');
INSERT INTO events VALUES(10,4,6,'goal',2,NULL,'2025-08-24 21:48:46');
CREATE TABLE event_drafts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('goal', 'yellow_card', 'red_card', 'substitution', 'other')),
    minute INTEGER NOT NULL CHECK (minute >= 0 AND minute <= 120),
    description TEXT,
    profile_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);
CREATE TABLE event_players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('main', 'assist', 'substituted_in', 'substituted_out')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    UNIQUE(event_id, player_id, role)
);
CREATE TABLE lineups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER NOT NULL,
    match_id INTEGER NOT NULL,
    timestamp DATETIME NOT NULL,
    matrix TEXT, -- JSON format for formation (e.g., "4-4-2")
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    UNIQUE(team_id, match_id)
);
CREATE TABLE streams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stream_date DATE NOT NULL,
    url TEXT NOT NULL,
    youtube_video_id TEXT NOT NULL,
    is_live_stream BOOLEAN NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT 0,
    title TEXT,
    thumbnail_url TEXT,
    published_at DATETIME,
    duration_seconds INTEGER,
    start_time DATETIME,
    end_time DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO streams VALUES(1,'2025-08-22','https://www.youtube.com/live/KYaYITO1Qjw','KYaYITO1Qjw',1,0,'Fecha 1','https://i.ytimg.com/vi/KYaYITO1Qjw/hqdefault.jpg',NULL,NULL,NULL,NULL,NULL,'2025-08-24 21:18:33');
CREATE TABLE preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('notification', 'privacy', 'display')),
    channel TEXT NOT NULL,
    lead_time_minutes INTEGER DEFAULT 15 CHECK (lead_time_minutes >= 0),
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    UNIQUE(profile_id, type, channel)
);
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT NOT NULL,
    match_id INTEGER,
    preference_id INTEGER,
    sent_at DATETIME,
    is_enabled BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    delivery_info TEXT, -- JSON with delivery details
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (preference_id) REFERENCES preferences(id) ON DELETE SET NULL
);
CREATE TABLE user_favorite_teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT NOT NULL,
    team_id INTEGER NOT NULL,
    favorited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    UNIQUE(profile_id, team_id)
);
CREATE TABLE user_favorite_matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT NOT NULL,
    match_id INTEGER NOT NULL,
    favorited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    UNIQUE(profile_id, match_id)
);
CREATE TABLE match_planilleros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL,
    profile_id TEXT NOT NULL,
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'admin_review')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    UNIQUE(match_id, profile_id)
);
CREATE TABLE scorecard_validations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL,
    validator_profile_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    comments TEXT,
    validated_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (validator_profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    UNIQUE(match_id, validator_profile_id)
);
CREATE TABLE match_attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'substitute')),
    jersey_number INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    UNIQUE(match_id, player_id)
);
CREATE TABLE match_attendance_drafts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    profile_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'substitute')),
    jersey_number INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    UNIQUE(match_id, player_id, profile_id)
);
CREATE TABLE match_admin_validations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL,
    admin_profile_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    comments TEXT,
    validated_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    UNIQUE(match_id)
);
CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts DATETIME DEFAULT CURRENT_TIMESTAMP,
    actor_profile_id TEXT NOT NULL,
    action TEXT NOT NULL, -- e.g., 'attendance.update', 'event.create'
    match_id INTEGER,
    team_id INTEGER,
    payload TEXT, -- JSON blob with details
    FOREIGN KEY (actor_profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);
CREATE TABLE team_pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER NOT NULL UNIQUE,
    description TEXT,
    instagram_handle TEXT,
    captain_email TEXT,
    founded_year INTEGER,
    achievements TEXT, -- JSON array of achievements
    motto TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);
CREATE TABLE team_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    caption TEXT,
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('join_team_requests',6);
INSERT INTO sqlite_sequence VALUES('competitions',1);
INSERT INTO sqlite_sequence VALUES('team_competitions',8);
INSERT INTO sqlite_sequence VALUES('teams',8);
INSERT INTO sqlite_sequence VALUES('matches',28);
INSERT INTO sqlite_sequence VALUES('players',0);
INSERT INTO sqlite_sequence VALUES('streams',1);
INSERT INTO sqlite_sequence VALUES('events',10);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_requests_team ON join_team_requests(team_id);
CREATE INDEX idx_requests_profile ON join_team_requests(profile_id);
CREATE INDEX idx_requests_status ON join_team_requests(status);
CREATE UNIQUE INDEX idx_requests_pending_unique ON join_team_requests(team_id, profile_id) WHERE status = 'pending';
CREATE INDEX idx_teams_captain ON teams(captain_id);
CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_players_profile ON players(profile_id);
CREATE INDEX idx_matches_competition ON matches(competition_id);
CREATE INDEX idx_matches_timestamp ON matches(timestamp);
CREATE INDEX idx_matches_teams ON matches(local_team_id, visitor_team_id);
CREATE INDEX idx_events_match ON events(match_id);
CREATE INDEX idx_events_team ON events(team_id);
CREATE INDEX idx_event_drafts_match ON event_drafts(match_id);
CREATE INDEX idx_event_drafts_match_profile ON event_drafts(match_id, profile_id);
CREATE INDEX idx_event_drafts_team ON event_drafts(match_id, team_id);
CREATE INDEX idx_lineups_match ON lineups(match_id);
CREATE UNIQUE INDEX idx_streams_date ON streams(stream_date);
CREATE UNIQUE INDEX idx_streams_video_id ON streams(youtube_video_id);
CREATE INDEX idx_streams_featured ON streams(is_featured);
CREATE INDEX idx_streams_published ON streams(published_at);
CREATE INDEX idx_notifications_profile ON notifications(profile_id);
CREATE INDEX idx_notifications_match ON notifications(match_id);
CREATE INDEX idx_favorites_teams_profile ON user_favorite_teams(profile_id);
CREATE INDEX idx_favorites_matches_profile ON user_favorite_matches(profile_id);
CREATE UNIQUE INDEX idx_players_team_jersey_unique
ON players(team_id, jersey_number)
WHERE jersey_number IS NOT NULL;
CREATE UNIQUE INDEX idx_attendance_match_jersey_unique
ON match_attendance(match_id, jersey_number)
WHERE jersey_number IS NOT NULL;
CREATE INDEX idx_attendance_drafts_match_profile ON match_attendance_drafts(match_id, profile_id);
CREATE INDEX idx_attendance_drafts_player ON match_attendance_drafts(match_id, player_id, profile_id);
CREATE INDEX idx_mp_match ON match_planilleros(match_id);
CREATE INDEX idx_sv_match ON scorecard_validations(match_id);
CREATE INDEX idx_ma_match ON match_attendance(match_id);
CREATE INDEX idx_mad_match ON match_attendance_drafts(match_id);
CREATE INDEX idx_admin_validations_match ON match_admin_validations(match_id);
CREATE INDEX idx_audit_match ON audit_log(match_id);
CREATE INDEX idx_audit_actor ON audit_log(actor_profile_id);
CREATE INDEX idx_events_match_team ON events(match_id, team_id, minute);
CREATE INDEX idx_team_pages_team ON team_pages(team_id);
CREATE INDEX idx_team_photos_team ON team_photos(team_id);
CREATE INDEX idx_team_photos_order ON team_photos(team_id, order_index);
CREATE TRIGGER update_profiles_timestamp
    AFTER UPDATE ON profiles
    FOR EACH ROW
    BEGIN
        UPDATE profiles 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = NEW.id;
    END;
CREATE TRIGGER update_teams_timestamp
    AFTER UPDATE ON teams
    FOR EACH ROW
    BEGIN
        UPDATE teams 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = NEW.id;
    END;
CREATE TRIGGER update_players_timestamp
    AFTER UPDATE ON players
    FOR EACH ROW
    BEGIN
        UPDATE players 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = NEW.id;
    END;
CREATE TRIGGER update_matches_timestamp
    AFTER UPDATE ON matches
    FOR EACH ROW
    BEGIN
        UPDATE matches 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = NEW.id;
    END;
CREATE TRIGGER update_join_requests_timestamp
    AFTER UPDATE ON join_team_requests
    FOR EACH ROW
    BEGIN
        UPDATE join_team_requests 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = NEW.id;
    END;
CREATE TRIGGER update_preferences_timestamp
    AFTER UPDATE ON preferences
    FOR EACH ROW
    BEGIN
        UPDATE preferences 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = NEW.id;
    END;
CREATE TRIGGER create_player_on_approval
    AFTER UPDATE ON join_team_requests
    FOR EACH ROW
    WHEN NEW.status = 'approved' AND OLD.status != 'approved'
    BEGIN
        INSERT INTO players (
            team_id, 
            profile_id, 
            first_name, 
            last_name, 
            nickname,
            birthday, 
            position,
            jersey_number,
            created_at,
            updated_at
        ) VALUES (
            NEW.team_id,
            NEW.profile_id,
            NEW.first_name,
            NEW.last_name,
            NEW.nickname,
            NEW.birthday,
            NEW.preferred_position,
            NEW.preferred_jersey_number,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );
    END;
CREATE TRIGGER create_player_on_instant_approval
    AFTER INSERT ON join_team_requests
    FOR EACH ROW
    WHEN NEW.status = 'approved'
    BEGIN
        INSERT INTO players (
            team_id, 
            profile_id, 
            first_name, 
            last_name, 
            nickname,
            birthday, 
            position,
            jersey_number,
            created_at,
            updated_at
        ) VALUES (
            NEW.team_id,
            NEW.profile_id,
            NEW.first_name,
            NEW.last_name,
            NEW.nickname,
            NEW.birthday,
            NEW.preferred_position,
            NEW.preferred_jersey_number,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );
    END;
CREATE TRIGGER remove_player_on_rejection
    AFTER UPDATE ON join_team_requests
    FOR EACH ROW
    WHEN NEW.status = 'rejected' AND OLD.status = 'approved'
    BEGIN
        DELETE FROM players 
        WHERE profile_id = NEW.profile_id AND team_id = NEW.team_id;
    END;
CREATE TRIGGER prevent_captain_removal
    BEFORE DELETE ON players
    FOR EACH ROW
    WHEN EXISTS (
        SELECT 1 FROM teams 
        WHERE id = OLD.team_id AND captain_id = OLD.profile_id
    )
    BEGIN
        SELECT RAISE(ABORT, 'Cannot remove team captain from team. Transfer captaincy first.');
    END;
CREATE TRIGGER update_scores_and_competition_points
    AFTER UPDATE ON matches
    FOR EACH ROW
    WHEN NEW.status = 'finished' AND OLD.status != 'finished'
    BEGIN
        -- First, recalculate match scores from goal events
        UPDATE matches 
        SET local_score = (
                SELECT COALESCE(COUNT(*), 0)
                FROM events 
                WHERE match_id = NEW.id 
                  AND type = 'goal' 
                  AND team_id = NEW.local_team_id
            ),
            visitor_score = (
                SELECT COALESCE(COUNT(*), 0)
                FROM events 
                WHERE match_id = NEW.id 
                  AND type = 'goal' 
                  AND team_id = NEW.visitor_team_id
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
        
        -- Then, recalculate all statistics for all teams in this competition from scratch
        -- This prevents race conditions by not accumulating values
        UPDATE team_competitions 
        SET 
            -- Points calculation
            points = (
                SELECT COALESCE(SUM(
                    CASE 
                        -- When team is local team
                        WHEN m.local_team_id = team_competitions.team_id THEN
                            CASE 
                                WHEN m.local_score > m.visitor_score THEN 3  -- Win
                                WHEN m.local_score = m.visitor_score THEN 1  -- Draw
                                ELSE 0  -- Loss
                            END
                        -- When team is visitor team
                        WHEN m.visitor_team_id = team_competitions.team_id THEN
                            CASE 
                                WHEN m.visitor_score > m.local_score THEN 3  -- Win
                                WHEN m.visitor_score = m.local_score THEN 1  -- Draw
                                ELSE 0  -- Loss
                            END
                        ELSE 0
                    END
                ), 0)
                FROM matches m
                WHERE m.competition_id = NEW.competition_id
                  AND m.status = 'finished'
                  AND (m.local_team_id = team_competitions.team_id OR m.visitor_team_id = team_competitions.team_id)
            ),
            -- PJ - Partidos Jugados (Played Games)
            pj = (
                SELECT COUNT(*)
                FROM matches m
                WHERE m.competition_id = NEW.competition_id
                  AND m.status = 'finished'
                  AND (m.local_team_id = team_competitions.team_id OR m.visitor_team_id = team_competitions.team_id)
            ),
            -- G - Ganados (Wins)
            g = (
                SELECT COUNT(*)
                FROM matches m
                WHERE m.competition_id = NEW.competition_id
                  AND m.status = 'finished'
                  AND (
                    (m.local_team_id = team_competitions.team_id AND m.local_score > m.visitor_score) OR
                    (m.visitor_team_id = team_competitions.team_id AND m.visitor_score > m.local_score)
                  )
            ),
            -- E - Empatados (Draws)
            e = (
                SELECT COUNT(*)
                FROM matches m
                WHERE m.competition_id = NEW.competition_id
                  AND m.status = 'finished'
                  AND m.local_score = m.visitor_score
                  AND (m.local_team_id = team_competitions.team_id OR m.visitor_team_id = team_competitions.team_id)
            ),
            -- P - Perdidos (Losses)
            p = (
                SELECT COUNT(*)
                FROM matches m
                WHERE m.competition_id = NEW.competition_id
                  AND m.status = 'finished'
                  AND (
                    (m.local_team_id = team_competitions.team_id AND m.local_score < m.visitor_score) OR
                    (m.visitor_team_id = team_competitions.team_id AND m.visitor_score < m.local_score)
                  )
            ),
            -- GF - Goles a Favor (Goals For)
            gf = (
                SELECT COALESCE(SUM(
                    CASE 
                        WHEN m.local_team_id = team_competitions.team_id THEN m.local_score
                        WHEN m.visitor_team_id = team_competitions.team_id THEN m.visitor_score
                        ELSE 0
                    END
                ), 0)
                FROM matches m
                WHERE m.competition_id = NEW.competition_id
                  AND m.status = 'finished'
                  AND (m.local_team_id = team_competitions.team_id OR m.visitor_team_id = team_competitions.team_id)
            ),
            -- GC - Goles en Contra (Goals Against)
            gc = (
                SELECT COALESCE(SUM(
                    CASE 
                        WHEN m.local_team_id = team_competitions.team_id THEN m.visitor_score
                        WHEN m.visitor_team_id = team_competitions.team_id THEN m.local_score
                        ELSE 0
                    END
                ), 0)
                FROM matches m
                WHERE m.competition_id = NEW.competition_id
                  AND m.status = 'finished'
                  AND (m.local_team_id = team_competitions.team_id OR m.visitor_team_id = team_competitions.team_id)
            )
        WHERE competition_id = NEW.competition_id;
        
        -- Update DG - Diferencia de Goles (Goal Difference) = GF - GC
        UPDATE team_competitions 
        SET dg = gf - gc
        WHERE competition_id = NEW.competition_id;
        
        -- Recalculate positions for this competition (Points first, then Goal Difference as tiebreaker)
        UPDATE team_competitions 
        SET position = (
            SELECT COUNT(*) + 1 
            FROM team_competitions tc2 
            WHERE tc2.competition_id = NEW.competition_id 
              AND (
                tc2.points > team_competitions.points OR 
                (tc2.points = team_competitions.points AND tc2.dg > team_competitions.dg)
              )
        )
        WHERE competition_id = NEW.competition_id;
    END;
CREATE TRIGGER update_scores_and_competition_points_on_delete
    AFTER DELETE ON matches
    FOR EACH ROW
    BEGIN
        -- First, recalculate match scores from goal events
        UPDATE matches 
        SET local_score = (
                SELECT COALESCE(COUNT(*), 0)
                FROM events 
                WHERE match_id = OLD.id 
                  AND type = 'goal' 
                  AND team_id = OLD.local_team_id
            ),
            visitor_score = (
                SELECT COALESCE(COUNT(*), 0)
                FROM events 
                WHERE match_id = OLD.id 
                  AND type = 'goal' 
                  AND team_id = OLD.visitor_team_id
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.id;
        
        -- Then, recalculate all statistics for all teams in this competition from scratch
        -- This prevents race conditions by not accumulating values
        UPDATE team_competitions 
        SET 
            -- Points calculation
            points = (
                SELECT COALESCE(SUM(
                    CASE 
                        -- When team is local team
                        WHEN m.local_team_id = team_competitions.team_id THEN
                            CASE 
                                WHEN m.local_score > m.visitor_score THEN 3  -- Win
                                WHEN m.local_score = m.visitor_score THEN 1  -- Draw
                                ELSE 0  -- Loss
                            END
                        -- When team is visitor team
                        WHEN m.visitor_team_id = team_competitions.team_id THEN
                            CASE 
                                WHEN m.visitor_score > m.local_score THEN 3  -- Win
                                WHEN m.visitor_score = m.local_score THEN 1  -- Draw
                                ELSE 0  -- Loss
                            END
                        ELSE 0
                    END
                ), 0)
                FROM matches m
                WHERE m.competition_id = OLD.competition_id
                  AND m.status = 'finished'
                  AND (m.local_team_id = team_competitions.team_id OR m.visitor_team_id = team_competitions.team_id)
            ),
            -- PJ - Partidos Jugados (Played Games)
            pj = (
                SELECT COUNT(*)
                FROM matches m
                WHERE m.competition_id = OLD.competition_id
                  AND m.status = 'finished'
                  AND (m.local_team_id = team_competitions.team_id OR m.visitor_team_id = team_competitions.team_id)
            ),
            -- G - Ganados (Wins)
            g = (
                SELECT COUNT(*)
                FROM matches m
                WHERE m.competition_id = OLD.competition_id
                  AND m.status = 'finished'
                  AND (
                    (m.local_team_id = team_competitions.team_id AND m.local_score > m.visitor_score) OR
                    (m.visitor_team_id = team_competitions.team_id AND m.visitor_score > m.local_score)
                  )
            ),
            -- E - Empatados (Draws)
            e = (
                SELECT COUNT(*)
                FROM matches m
                WHERE m.competition_id = OLD.competition_id
                  AND m.status = 'finished'
                  AND m.local_score = m.visitor_score
                  AND (m.local_team_id = team_competitions.team_id OR m.visitor_team_id = team_competitions.team_id)
            ),
            -- P - Perdidos (Losses)
            p = (
                SELECT COUNT(*)
                FROM matches m
                WHERE m.competition_id = OLD.competition_id
                  AND m.status = 'finished'
                  AND (
                    (m.local_team_id = team_competitions.team_id AND m.local_score < m.visitor_score) OR
                    (m.visitor_team_id = team_competitions.team_id AND m.visitor_score < m.local_score)
                  )
            ),
            -- GF - Goles a Favor (Goals For)
            gf = (
                SELECT COALESCE(SUM(
                    CASE 
                        WHEN m.local_team_id = team_competitions.team_id THEN m.local_score
                        WHEN m.visitor_team_id = team_competitions.team_id THEN m.visitor_score
                        ELSE 0
                    END
                ), 0)
                FROM matches m
                WHERE m.competition_id = OLD.competition_id
                  AND m.status = 'finished'
                  AND (m.local_team_id = team_competitions.team_id OR m.visitor_team_id = team_competitions.team_id)
            ),
            -- GC - Goles en Contra (Goals Against)
            gc = (
                SELECT COALESCE(SUM(
                    CASE 
                        WHEN m.local_team_id = team_competitions.team_id THEN m.visitor_score
                        WHEN m.visitor_team_id = team_competitions.team_id THEN m.local_score
                        ELSE 0
                    END
                ), 0)
                FROM matches m
                WHERE m.competition_id = OLD.competition_id
                  AND m.status = 'finished'
                  AND (m.local_team_id = team_competitions.team_id OR m.visitor_team_id = team_competitions.team_id)
            )
        WHERE competition_id = OLD.competition_id;
        
        -- Update DG - Diferencia de Goles (Goal Difference) = GF - GC
        UPDATE team_competitions 
        SET dg = gf - gc
        WHERE competition_id = OLD.competition_id;
        
        -- Recalculate positions for this competition (Points first, then Goal Difference as tiebreaker)
        UPDATE team_competitions 
        SET position = (
            SELECT COUNT(*) + 1 
            FROM team_competitions tc2 
            WHERE tc2.competition_id = OLD.competition_id 
              AND (
                tc2.points > team_competitions.points OR 
                (tc2.points = team_competitions.points AND tc2.dg > team_competitions.dg)
              )
        )
        WHERE competition_id = OLD.competition_id;
    END;
CREATE TRIGGER prevent_overlapping_matches
    BEFORE INSERT ON matches
    FOR EACH ROW
    WHEN EXISTS (
        SELECT 1 FROM matches 
        WHERE (local_team_id = NEW.local_team_id OR visitor_team_id = NEW.local_team_id 
               OR local_team_id = NEW.visitor_team_id OR visitor_team_id = NEW.visitor_team_id)
          AND ABS(CAST((julianday(NEW.timestamp) - julianday(timestamp)) * 24 * 60 AS INTEGER)) < 120  -- 2 hours
          AND status != 'cancelled'
    )
    BEGIN
        SELECT RAISE(ABORT, 'Team has another match within 2 hours of this time.');
    END;
CREATE TRIGGER create_team_competition_record
    AFTER INSERT ON teams
    FOR EACH ROW
    BEGIN
        INSERT INTO team_competitions (
            team_id,
            competition_id,
            points,
            pj,
            g,
            e,
            p,
            gf,
            gc,
            dg
        )
        SELECT 
            NEW.id,
            c.id,
            0,  -- points
            0,  -- pj (played games)
            0,  -- g (wins)
            0,  -- e (draws)
            0,  -- p (losses)
            0,  -- gf (goals for)
            0,  -- gc (goals against)
            0   -- dg (goal difference)
        FROM competitions c;
    END;
CREATE TRIGGER validate_event_minute
    BEFORE INSERT ON events
    FOR EACH ROW
    WHEN NEW.minute > 120  -- Allow up to 120 minutes (90 + 30 extra time)
    BEGIN
        SELECT RAISE(ABORT, 'Event minute cannot exceed 120 minutes.');
    END;
CREATE TRIGGER cleanup_join_request_on_player_deletion
    AFTER DELETE ON players
    FOR EACH ROW
    BEGIN
        -- Update the join request status to 'rejected' instead of deleting
        -- This preserves history but allows new requests
        UPDATE join_team_requests 
        SET status = 'rejected',
            updated_at = CURRENT_TIMESTAMP
        WHERE profile_id = OLD.profile_id 
          AND team_id = OLD.team_id 
          AND status = 'approved';
    END;
CREATE TRIGGER prevent_duplicate_pending_requests
    BEFORE INSERT ON join_team_requests
    FOR EACH ROW
    WHEN EXISTS (
        SELECT 1 FROM join_team_requests 
        WHERE profile_id = NEW.profile_id 
          AND team_id = NEW.team_id 
          AND status = 'pending'
    )
    BEGIN
        SELECT RAISE(ABORT, 'Ya tienes una solicitud pendiente para este equipo.');
    END;
CREATE TRIGGER prevent_request_if_already_player
    BEFORE INSERT ON join_team_requests
    FOR EACH ROW
    WHEN EXISTS (
        SELECT 1 FROM players 
        WHERE profile_id = NEW.profile_id 
          AND team_id = NEW.team_id
    )
    BEGIN
        SELECT RAISE(ABORT, 'Ya eres miembro de este equipo.');
    END;
CREATE TRIGGER update_match_planilleros_ts
    BEFORE UPDATE ON match_planilleros
    FOR EACH ROW
    BEGIN
        UPDATE match_planilleros 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = NEW.id;
    END;
CREATE TRIGGER update_attendance_ts
    BEFORE UPDATE ON match_attendance
    FOR EACH ROW
    BEGIN
        UPDATE match_attendance 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = NEW.id;
    END;
CREATE TRIGGER update_attendance_drafts_ts
    BEFORE UPDATE ON match_attendance_drafts
    FOR EACH ROW
    BEGIN
        UPDATE match_attendance_drafts
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
    END;
CREATE TRIGGER check_match_completion
    AFTER UPDATE ON match_planilleros
    FOR EACH ROW
    WHEN NEW.status = 'completed' AND OLD.status != 'completed'
    BEGIN
        -- If both planilleros completed, go directly to admin_review
        UPDATE matches 
        SET status = 'admin_review'
        WHERE id = NEW.match_id
          AND status = 'live'
          AND (
            SELECT COUNT(*) 
            FROM match_planilleros 
            WHERE match_id = NEW.match_id AND status = 'completed'
          ) = 2;
          
        -- Update planilleros status to admin_review when both complete
        UPDATE match_planilleros
        SET status = 'admin_review'
        WHERE match_id = NEW.match_id
          AND status = 'completed'
          AND EXISTS (SELECT 1 FROM matches WHERE id = NEW.match_id AND status = 'admin_review');
    END;
CREATE TRIGGER check_admin_approval
    AFTER UPDATE ON match_admin_validations
    FOR EACH ROW
    WHEN NEW.status = 'approved'
    BEGIN
        -- Promote one planillero's drafts to final tables (use first profile_id alphabetically for consistency)
        INSERT OR REPLACE INTO match_attendance (match_id, player_id, status, jersey_number, created_at)
        SELECT mad.match_id, mad.player_id, mad.status, mad.jersey_number, CURRENT_TIMESTAMP
        FROM match_attendance_drafts mad
        WHERE mad.match_id = NEW.match_id 
          AND mad.profile_id = (
            SELECT MIN(profile_id) FROM match_planilleros WHERE match_id = NEW.match_id
          );
          
        -- Promote events to final tables
        INSERT INTO events (match_id, team_id, type, minute, description, created_at)
        SELECT ed.match_id, ed.team_id, ed.type, ed.minute, ed.description, CURRENT_TIMESTAMP
        FROM event_drafts ed
        WHERE ed.match_id = NEW.match_id 
          AND ed.profile_id = (
            SELECT MIN(profile_id) FROM match_planilleros WHERE match_id = NEW.match_id
          );
          
        -- Create event_players entries
        INSERT INTO event_players (event_id, player_id, role, created_at)
        SELECT e.id, ed.player_id, 'main', CURRENT_TIMESTAMP
        FROM events e
        JOIN event_drafts ed ON ed.match_id = e.match_id AND ed.team_id = e.team_id AND ed.type = e.type AND ed.minute = e.minute
        WHERE e.match_id = NEW.match_id
          AND ed.profile_id = (
            SELECT MIN(profile_id) FROM match_planilleros WHERE match_id = NEW.match_id
          )
          AND NOT EXISTS (SELECT 1 FROM event_players WHERE event_id = e.id);
        
        -- Finish match when admin approves
        UPDATE matches 
        SET status = 'finished'
        WHERE id = NEW.match_id AND status = 'admin_review';
    END;
CREATE TRIGGER validate_event_drafts_minute
    BEFORE INSERT ON event_drafts
    FOR EACH ROW
    WHEN NEW.minute > 120
    BEGIN
        SELECT RAISE(ABORT, 'Event minute cannot exceed 120 minutes.');
    END;
CREATE TRIGGER update_event_drafts_ts
    BEFORE UPDATE ON event_drafts
    FOR EACH ROW
    BEGIN
        UPDATE event_drafts
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
    END;
