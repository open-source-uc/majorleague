DROP TABLE IF EXISTS profiles;

-- Id comes from auth.osuc.dev
CREATE TABLE profiles (
    id INTEGER PRIMARY KEY UNIQUE,
    username TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);