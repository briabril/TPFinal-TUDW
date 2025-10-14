export interface Comment {
  id: string;
  author_id: string;
  author_username: string;
  post_id: string;
  text: string;
  parent_id?: string | number | null;
  created_at: string;
  updated_at?: string;
  children?: Comment[];
}
export interface User {
  id: string;
  email: string;
  username: string;
  bio?: string;
  displayname: string;
  profile_picture_url?: string;
  role: "ADMIN" | "USER";
  status: "ACTIVE" | "PENDING_VERIFICATION" | "SUSPENDED";
  created_at?: Date;
  updated_at?: Date;
}

export interface DbUser extends User {
  password_hash: string;
}