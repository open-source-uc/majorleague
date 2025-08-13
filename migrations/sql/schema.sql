-- Major League Database Schema
-- Optimized for Cloudflare D1 and BCNF compliance

-- Drop existing tables in correct order (foreign keys first)
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS match_attendance;
DROP TABLE IF EXISTS scorecard_validations;
DROP TABLE IF EXISTS match_planilleros;
DROP TABLE IF EXISTS streams;
DROP TABLE IF EXISTS lineups;
DROP TABLE IF EXISTS event_players;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS team_competitions;
DROP TABLE IF EXISTS join_team_requests;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS competitions;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS preferences;
DROP TABLE IF EXISTS user_favorite_matches;
DROP TABLE IF EXISTS user_favorite_teams;
DROP TABLE IF EXISTS profiles;

-- Core Tables

-- Profiles (Users from auth.osuc.dev)
CREATE TABLE profiles (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Competitions (Tournaments/Seasons)
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

-- Teams
CREATE TABLE teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    captain_id TEXT NOT NULL,
    major TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (captain_id) REFERENCES profiles(id) ON DELETE RESTRICT
);

-- Players (Extended profile info for team participation)
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

-- Team Competition Participation
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

-- Matches
CREATE TABLE matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    local_team_id INTEGER NOT NULL,
    visitor_team_id INTEGER NOT NULL,
    competition_id INTEGER NOT NULL,
    timestamp DATETIME NOT NULL,
    location TEXT,
    local_score INTEGER DEFAULT 0,
    visitor_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'in_review', 'finished', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (local_team_id) REFERENCES teams(id) ON DELETE RESTRICT,
    FOREIGN KEY (visitor_team_id) REFERENCES teams(id) ON DELETE RESTRICT,
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
    CHECK (local_team_id != visitor_team_id)
);

-- Events (Goals, Cards, Substitutions, etc.)
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

-- Event Players (Many-to-many: Events can involve multiple players)
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

-- Lineups
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

-- Streams (Live streaming info)
CREATE TABLE streams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('youtube', 'twitch', 'other')),
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    start_time DATETIME,
    end_time DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

-- Join Team Requests
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

-- User Preferences
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

-- Notifications
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

-- User Favorite Teams
CREATE TABLE user_favorite_teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT NOT NULL,
    team_id INTEGER NOT NULL,
    favorited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    UNIQUE(profile_id, team_id)
);

-- User Favorite Matches
CREATE TABLE user_favorite_matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT NOT NULL,
    match_id INTEGER NOT NULL,
    favorited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    UNIQUE(profile_id, match_id)
);

-- Match Planilleros (Scorecard keepers)
CREATE TABLE match_planilleros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    profile_id TEXT NOT NULL,
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    UNIQUE(match_id, team_id),
    UNIQUE(match_id, profile_id)
);

-- Scorecard Validations (Cross-validation between planilleros)
CREATE TABLE scorecard_validations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL,
    validator_profile_id TEXT NOT NULL,
    validated_team_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    comments TEXT,
    validated_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (validator_profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (validated_team_id) REFERENCES teams(id) ON DELETE CASCADE,
    UNIQUE(match_id, validator_profile_id, validated_team_id)
);

-- Match Attendance (Player presence and jersey numbers for each match)
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

-- Audit Log (Track all important actions)
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

-- Indexes for performance optimization
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_teams_captain ON teams(captain_id);
CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_players_profile ON players(profile_id);
CREATE INDEX idx_matches_competition ON matches(competition_id);
CREATE INDEX idx_matches_timestamp ON matches(timestamp);
CREATE INDEX idx_matches_teams ON matches(local_team_id, visitor_team_id);
CREATE INDEX idx_events_match ON events(match_id);
CREATE INDEX idx_events_team ON events(team_id);
CREATE INDEX idx_lineups_match ON lineups(match_id);
CREATE INDEX idx_streams_match ON streams(match_id);
CREATE INDEX idx_requests_team ON join_team_requests(team_id);
CREATE INDEX idx_requests_profile ON join_team_requests(profile_id);
CREATE INDEX idx_requests_status ON join_team_requests(status);
CREATE UNIQUE INDEX idx_requests_pending_unique ON join_team_requests(team_id, profile_id) WHERE status = 'pending';
CREATE INDEX idx_notifications_profile ON notifications(profile_id);
CREATE INDEX idx_notifications_match ON notifications(match_id);
CREATE INDEX idx_favorites_teams_profile ON user_favorite_teams(profile_id);
CREATE INDEX idx_favorites_matches_profile ON user_favorite_matches(profile_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_players_team_jersey_unique
ON players(team_id, jersey_number)
WHERE jersey_number IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_match_jersey_unique
ON match_attendance(match_id, jersey_number)
WHERE jersey_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_mp_match ON match_planilleros(match_id);
CREATE INDEX IF NOT EXISTS idx_sv_match ON scorecard_validations(match_id);
CREATE INDEX IF NOT EXISTS idx_ma_match ON match_attendance(match_id);
CREATE INDEX IF NOT EXISTS idx_audit_match ON audit_log(match_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor_profile_id);
CREATE INDEX IF NOT EXISTS idx_events_match_team ON events(match_id, team_id, minute);