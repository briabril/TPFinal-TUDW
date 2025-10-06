export type ID = string | number;

export interface Comment {
  id: ID;
  author_id: string;
  post_id: string;
  text: string;
  parent_id?: ID | null;
  created_at: string;
  updated_at?: string;
  children?: Comment[];
}

export interface CommentResponse extends Comment {}
