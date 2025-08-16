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
DROP TRIGGER IF EXISTS check_match_completion;
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

-- 19. Auto-complete match when both scorecards are validated
CREATE TRIGGER check_match_completion
    AFTER UPDATE ON scorecard_validations
    FOR EACH ROW
    WHEN NEW.status = 'approved'
    BEGIN
        -- Only finish if both teams were validated by the corresponding rival planillero
        UPDATE matches 
        SET status = 'finished'
        WHERE id = NEW.match_id
          AND status = 'in_review'
          AND EXISTS (
            -- Validation of local team by visitor planillero
            SELECT 1 FROM scorecard_validations sv1
            JOIN match_planilleros mp1 ON sv1.validator_profile_id = mp1.profile_id
            JOIN matches m1 ON sv1.match_id = m1.id
            WHERE sv1.match_id = NEW.match_id
              AND sv1.validated_team_id = m1.local_team_id
              AND mp1.team_id = m1.visitor_team_id
              AND sv1.status = 'approved'
          )
          AND EXISTS (
            -- Validation of visitor team by local planillero  
            SELECT 1 FROM scorecard_validations sv2
            JOIN match_planilleros mp2 ON sv2.validator_profile_id = mp2.profile_id
            JOIN matches m2 ON sv2.match_id = m2.id
            WHERE sv2.match_id = NEW.match_id
              AND sv2.validated_team_id = m2.visitor_team_id
              AND mp2.team_id = m2.local_team_id
              AND sv2.status = 'approved'
          );
    END;
