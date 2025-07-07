export interface UserData {
  id: string;
  message: string;
  permissions: string[];
}

export interface Profile {
  id: number;
  username: string;
  email?: string;
  created_at: string;
  updated_at: string;
}
