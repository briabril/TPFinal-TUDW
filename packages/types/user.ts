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
  posts_count?: number;
  followers_count?: number;
  following_count?: number;
}

export interface DbUser extends User {
  password_hash: string;
}

// Estado de bloqueo entre dos usuarios
export interface BlockStatus {
  blockedByYou: boolean;
  blockedByThem: boolean;
}

// Estado de seguimiento entre dos usuarios
export interface FollowStatus {
  isFollowing: boolean;
  isFollowedBy: boolean;
}
