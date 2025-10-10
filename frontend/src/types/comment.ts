

export interface Comment {
  id: string ;
  author_id: string;
  post_id: string;
  text: string;
  parent_id?: string | number| null;
  created_at: string;
  updated_at?: string;
  children?: Comment[];
}

export interface CommentResponse extends Comment {}
