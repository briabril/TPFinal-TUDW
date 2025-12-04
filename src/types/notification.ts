export interface RefPost {
  id: string;
  content?: string | null;
  image_url?: string | null;
  author?: any;
}

export interface RefComment {
  id: string;
  text: string;
  post_id: string;
  author?: any;
}

export interface RefUser {
  id: string;
  username: string;
  displayname?: string | null;
  profile_picture_url?: string | null;
}

export type NotificationType =
  | "LIKE_POST"
  | "LIKE_COMMENT"
  | "COMMENT"
  | "FOLLOW"
  | "MESSAGE"
  | "REPORT";

export interface Notification {
  id: string;
  user_id: string;
  sender_id?: string | null;

  sender: {
    id: string;
    username: string;
    displayname: string | null;
    profile_picture_url: string | null;
  };

  type: NotificationType;

  ref_id?: string | null;
  ref_type?: string | null;

  ref?: RefPost | RefComment | RefUser | null;

  message?: string | null;
  metadata?: any;
  created_at: string;
  is_seen: boolean;
}
