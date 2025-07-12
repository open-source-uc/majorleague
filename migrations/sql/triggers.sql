-- Triggers for Major League Database
-- Maintains data integrity and automates business logic

-- 1. Update timestamps on profile changes
CREATE TRIGGER update_profiles_timestamp
    AFTER UPDATE ON profiles
    FOR EACH ROW
    BEGIN
        UPDATE profiles 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = NEW.id;
    END;

-- 2. Update timestamps on team changes
CREATE TRIGGER update_teams_timestamp
    AFTER UPDATE ON teams
    FOR EACH ROW
    BEGIN
        UPDATE teams 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = NEW.id;
    END;

-- 3. Update timestamps on player changes
CREATE TRIGGER update_players_timestamp
    AFTER UPDATE ON players
    FOR EACH ROW
    BEGIN
        UPDATE players 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = NEW.id;
    END;

-- 4. Update timestamps on match changes
CREATE TRIGGER update_matches_timestamp
    AFTER UPDATE ON matches
    FOR EACH ROW
    BEGIN
        UPDATE matches 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = NEW.id;
    END;

-- 5. Update timestamps on join requests
CREATE TRIGGER update_join_requests_timestamp
    AFTER UPDATE ON join_team_requests
    FOR EACH ROW
    BEGIN
        UPDATE join_team_requests 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = NEW.id;
    END;

-- 6. Update timestamps on preferences
CREATE TRIGGER update_preferences_timestamp
    AFTER UPDATE ON preferences
    FOR EACH ROW
    BEGIN
        UPDATE preferences 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = NEW.id;
    END;

-- 7. Auto-create player record when join request is approved
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
            age, 
            position
        ) VALUES (
            NEW.team_id,
            NEW.profile_id,
            NEW.first_name,
            NEW.last_name,
            NEW.age,
            NEW.preferred_position
        );
    END;

-- 8. Remove player from team when request is rejected after being approved
CREATE TRIGGER remove_player_on_rejection
    AFTER UPDATE ON join_team_requests
    FOR EACH ROW
    WHEN NEW.status = 'rejected' AND OLD.status = 'approved'
    BEGIN
        DELETE FROM players 
        WHERE profile_id = NEW.profile_id AND team_id = NEW.team_id;
    END;

-- 9. Prevent team captain from being removed from team
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

-- 10. Auto-update team competition points when match finishes
CREATE TRIGGER update_competition_points
    AFTER UPDATE ON matches
    FOR EACH ROW
    WHEN NEW.status = 'finished' AND OLD.status != 'finished'
    BEGIN
        -- Update local team points
        UPDATE team_competitions 
        SET points = points + 
            CASE 
                WHEN NEW.local_score > NEW.visitor_score THEN 3  -- Win
                WHEN NEW.local_score = NEW.visitor_score THEN 1  -- Draw
                ELSE 0  -- Loss
            END
        WHERE team_id = NEW.local_team_id 
          AND competition_id = NEW.competition_id;
        
        -- Update visitor team points
        UPDATE team_competitions 
        SET points = points + 
            CASE 
                WHEN NEW.visitor_score > NEW.local_score THEN 3  -- Win
                WHEN NEW.visitor_score = NEW.local_score THEN 1  -- Draw
                ELSE 0  -- Loss
            END
        WHERE team_id = NEW.visitor_team_id 
          AND competition_id = NEW.competition_id;
    END;

-- 11. Prevent overlapping matches for same team
CREATE TRIGGER prevent_overlapping_matches
    BEFORE INSERT ON matches
    FOR EACH ROW
    WHEN EXISTS (
        SELECT 1 FROM matches 
        WHERE (local_team_id = NEW.local_team_id OR visitor_team_id = NEW.local_team_id 
               OR local_team_id = NEW.visitor_team_id OR visitor_team_id = NEW.visitor_team_id)
          AND date = NEW.date
          AND ABS(CAST((julianday(NEW.timestamptz) - julianday(timestamptz)) * 24 * 60 AS INTEGER)) < 120  -- 2 hours
          AND status != 'cancelled'
    )
    BEGIN
        SELECT RAISE(ABORT, 'Team has another match within 2 hours of this time.');
    END;

-- 12. Auto-create team competition record when team is created
CREATE TRIGGER create_team_competition_record
    AFTER INSERT ON teams
    FOR EACH ROW
    BEGIN
        INSERT INTO team_competitions (
            team_id,
            competition_id,
            points
        )
        SELECT 
            NEW.id,
            c.id,
            0
        FROM competitions c
        WHERE c.end_date >= DATE('now');  -- Only active competitions
    END;

-- 13. Validate event minute is within match duration
CREATE TRIGGER validate_event_minute
    BEFORE INSERT ON events
    FOR EACH ROW
    WHEN NEW.minute > 90 AND NOT EXISTS (
        SELECT 1 FROM events 
        WHERE match_id = NEW.match_id 
          AND type = 'other' 
          AND description LIKE '%extra time%'
    )
    BEGIN
        SELECT RAISE(ABORT, 'Event minute cannot exceed 90 without extra time being recorded.');
    END;

-- 14. Auto-update match status when events are added
CREATE TRIGGER update_match_status_on_events
    AFTER INSERT ON events
    FOR EACH ROW
    WHEN NEW.type IN ('goal', 'yellow_card', 'red_card', 'substitution')
    BEGIN
        UPDATE matches 
        SET status = 'live',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.match_id AND status = 'scheduled';
    END;
