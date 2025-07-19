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
            nickname,
            age, 
            position,
            created_at,
            updated_at
        ) VALUES (
            NEW.team_id,
            NEW.profile_id,
            NEW.first_name,
            NEW.last_name,
            CASE 
                WHEN LENGTH(TRIM(COALESCE(NEW.first_name, ''))) > 0 
                THEN SUBSTR(NEW.first_name, 1, 1) || LOWER(SUBSTR(NEW.first_name, 2)) || 'ito'
                ELSE NULL 
            END,
            NEW.age,
            NEW.preferred_position,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );
    END;

-- 7b. Auto-create player record when join request is created as approved (instant approval)
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
            age, 
            position,
            created_at,
            updated_at
        ) VALUES (
            NEW.team_id,
            NEW.profile_id,
            NEW.first_name,
            NEW.last_name,
            CASE 
                WHEN LENGTH(TRIM(COALESCE(NEW.first_name, ''))) > 0 
                THEN SUBSTR(NEW.first_name, 1, 1) || LOWER(SUBSTR(NEW.first_name, 2)) || 'ito'
                ELSE NULL 
            END,
            NEW.age,
            NEW.preferred_position,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
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

-- 10. Auto-update match scores and competition points when match finishes
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
        
        -- Then, recalculate points for all teams in this competition from scratch
        -- This prevents race conditions by not accumulating points
        UPDATE team_competitions 
        SET points = (
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
        )
        WHERE competition_id = NEW.competition_id;
        
        -- Recalculate positions for this competition
        UPDATE team_competitions 
        SET position = (
            SELECT COUNT(*) + 1 
            FROM team_competitions tc2 
            WHERE tc2.competition_id = NEW.competition_id 
              AND tc2.points > team_competitions.points
        )
        WHERE competition_id = NEW.competition_id;
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
        FROM competitions c;
    END;

-- 13. Validate event minute is within reasonable match duration
CREATE TRIGGER validate_event_minute
    BEFORE INSERT ON events
    FOR EACH ROW
    WHEN NEW.minute > 120  -- Allow up to 120 minutes (90 + 30 extra time)
    BEGIN
        SELECT RAISE(ABORT, 'Event minute cannot exceed 120 minutes.');
    END;
