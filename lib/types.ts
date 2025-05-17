// Types for Major League database tables

export interface Team {
  id: number;
  name: string;
  major: string;
  captain_id?: number | null;
}

export interface Player {
  id: number;
  team_id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  nickname: string;
  age: number;
  position: string;
}

export interface Competition {
  id: number;
  name: string;
  year: number;
  semester: number;
  start_date: string; // date
  end_date: string;   // date
}

export interface TeamCompetition {
  team_id: number;
  competition_id: number;
  points: number;
  position: number;
}

export interface Match {
  id: number;
  local_team_id: number;
  visitor_team_id: number;
  competition_id: number;
  stream_id?: number | null;
  date: string; // timestamp with time zone
  time: string; // timestamp with time zone
  location: string; // url to Ubicate
  local_score: number;
  visitor_score: number;
} 