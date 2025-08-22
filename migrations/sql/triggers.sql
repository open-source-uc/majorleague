-- Drop all triggers
DROP TRIGGER IF EXISTS update_profiles_timestamp;
DROP TRIGGER IF EXISTS update_teams_timestamp;
DROP TRIGGER IF EXISTS update_players_timestamp;
DROP TRIGGER IF EXISTS update_matches_timestamp;
DROP TRIGGER IF EXISTS update_join_requests_timestamp;
DROP TRIGGER IF EXISTS update_preferences_timestamp;
DROP TRIGGER IF EXISTS create_player_on_approval;
DROP TRIGGER IF EXISTS create_player_on_instant_approval;
DROP TRIGGER IF EXISTS remove_player_on_rejection;
DROP TRIGGER IF EXISTS prevent_captain_removal;
DROP TRIGGER IF EXISTS update_scores_and_competition_points;
DROP TRIGGER IF EXISTS prevent_overlapping_matches;
DROP TRIGGER IF EXISTS create_team_competition_record;
DROP TRIGGER IF EXISTS validate_event_minute;
DROP TRIGGER IF EXISTS cleanup_join_request_on_player_deletion;
DROP TRIGGER IF EXISTS prevent_duplicate_pending_requests;
DROP TRIGGER IF EXISTS prevent_request_if_already_player;
DROP TRIGGER IF EXISTS update_match_planilleros_ts;
DROP TRIGGER IF EXISTS update_attendance_ts;
DROP TRIGGER IF EXISTS update_attendance_drafts_ts;
DROP TRIGGER IF EXISTS update_event_drafts_ts;
DROP TRIGGER IF EXISTS check_match_completion;
DROP TRIGGER IF EXISTS check_planillero_agreement;
DROP TRIGGER IF EXISTS check_admin_approval;
DROP TRIGGER IF EXISTS validate_event_drafts_minute;
DROP TRIGGER IF EXISTS update_scores_and_competition_points_on_delete;


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

-- 10.a. Auto-update match scores and competition points when match finishes
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

-- 10.b. Auto-update match scores and competition points when match is deleted
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

-- 11. Prevent overlapping matches for same team
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

-- 12. Auto-create team competition record when team is created
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

-- 13. Validate event minute is within reasonable match duration
CREATE TRIGGER validate_event_minute
    BEFORE INSERT ON events
    FOR EACH ROW
    WHEN NEW.minute > 120  -- Allow up to 120 minutes (90 + 30 extra time)
    BEGIN
        SELECT RAISE(ABORT, 'Event minute cannot exceed 120 minutes.');
    END;

-- 14. Clean up join request when player is deleted
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

-- 15. Prevent duplicate pending requests for same team/profile combination
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

-- 16. Prevent new request if user is already an approved player
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

-- 17. Auto-update timestamps for match_planilleros
CREATE TRIGGER update_match_planilleros_ts
    BEFORE UPDATE ON match_planilleros
    FOR EACH ROW
    BEGIN
        UPDATE match_planilleros 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = NEW.id;
    END;

-- 18. Auto-update timestamps for match_attendance
CREATE TRIGGER update_attendance_ts
    BEFORE UPDATE ON match_attendance
    FOR EACH ROW
    BEGIN
        UPDATE match_attendance 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = NEW.id;
    END;

-- 18b. Auto-update timestamps for match_attendance_drafts
CREATE TRIGGER update_attendance_drafts_ts
    BEFORE UPDATE ON match_attendance_drafts
    FOR EACH ROW
    BEGIN
        UPDATE match_attendance_drafts
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
    END;

-- 19. Handle when planillero completes their work (SIMPLIFIED)
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

-- 20. Handle admin final approval (SIMPLIFIED)  
-- Note: Planillero validation workflow removed - admins now handle all final decisions

-- 21. Handle admin final approval (ENHANCED)
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

-- Trigger 22 removed - admin rejection no longer exists
-- Admins always finalize matches by approving with consolidated data

-- 23. Validate event_drafts minute is within reasonable match duration
CREATE TRIGGER validate_event_drafts_minute
    BEFORE INSERT ON event_drafts
    FOR EACH ROW
    WHEN NEW.minute > 120
    BEGIN
        SELECT RAISE(ABORT, 'Event minute cannot exceed 120 minutes.');
    END;

-- 24. Auto-update timestamps for event_drafts
CREATE TRIGGER update_event_drafts_ts
    BEFORE UPDATE ON event_drafts
    FOR EACH ROW
    BEGIN
        UPDATE event_drafts
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
    END;
