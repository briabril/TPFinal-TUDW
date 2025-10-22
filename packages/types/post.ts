export interface Media {
  url: string;
  type: string;
}

export interface Post {
  id: string;
  text: string;
  link_url?: string | null;
  created_at: string;
  author_id: string;
  medias: Media[];
   comments_count: number;
}
