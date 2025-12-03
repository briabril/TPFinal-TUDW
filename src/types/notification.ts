export interface Notification {
  id: string;
  user_id: string;
  sender_id?: string | null;
  avatar_sender_username?: string;
  reciptien_username: string;
  sender_username: string;
  type: "LIKE" | "COMMENT" | "FOLLOW" | "MESSAGE" | "REPORT";
  ref_id?: string | null;
  ref_type?: string | null;
  message?: string | null;
  metadata?: any;
  created_at: string;
  is_seen: boolean;
}
