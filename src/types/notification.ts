export interface Notification {
  id: string;
  type: string;
  ref_id?: string;
  created_at: string;
  receiver: {
    id: string;
    username: string;
    displayname?: string;
  };
  actor?: {
    id: string;
    username: string;
    displayname?: string;
  };
}