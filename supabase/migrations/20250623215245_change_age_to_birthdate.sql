-- Migration to change age (int) to birthdate (date) in players and join_team_requests tables

-- Step 1: Drop the age column from players table and add birthdate
ALTER TABLE public.players 
DROP COLUMN age,
ADD COLUMN birthdate date;

-- Step 2: Drop the age column from join_team_requests table and add birthdate
ALTER TABLE public.join_team_requests 
DROP COLUMN age,
ADD COLUMN birthdate date;