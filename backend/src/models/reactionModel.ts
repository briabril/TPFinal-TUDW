import db from "../db";

interface Reaction{
    user_id: string;
    post_id: string | null;
    comment_id: string | null ;
    created_at: Date;
}

export const togglePostLikeDB = async (user_id: string, post_id: string) : Promise<{liked: boolean}> =>{
    const existing = await db.query<Reaction>(`
        SELECT 1 FROM reaction WHERE user_id = $1 and post_id = $2
        `, [user_id, post_id]);

          const hasReaction = existing?.rowCount && existing.rowCount > 0;

    if(hasReaction){
        await db.query<Reaction>(`DELETE FROM reaction WHERE user_id = $1 AND post_id = $2`, [user_id, post_id]);
        await db.query(
      `DELETE FROM user_interactions WHERE user_id = $1 AND post_id = $2 AND interaction_type = 'like'`,
      [user_id, post_id]
    );
        return {liked: false}
    }else{
        await db.query<Reaction>(
            `INSERT INTO reaction (user_id, post_id) VALUES ($1, $2)`, [user_id, post_id]
        )
          await db.query(
      `INSERT INTO user_interactions (user_id, post_id, interaction_type) VALUES ($1, $2, 'like')`,
      [user_id, post_id]
    );
      await db.query(`
  INSERT INTO user_interests (user_id, topic_id, weight)
  SELECT $1, pt.topic_id, 1.0
  FROM post_topics pt
  WHERE pt.post_id = $2
  ON CONFLICT (user_id, topic_id)
  DO UPDATE SET weight = user_interests.weight + 1.0;
`, [user_id, post_id]);
        return {liked: true}
    }   
}

export const toggleCommenLikeDB = async (user_id: string, comment_id: string) : Promise<{liked: boolean}>=>{
    const existing = await db.query<Reaction>(`
        SELECT 1 FROM reaction WHERE user_id = $1 and comment_id = $2
        `, [user_id, comment_id]);
                  const hasReaction = existing?.rowCount && existing.rowCount > 0;

    if(hasReaction){
        await db.query<Reaction>(`DELETE FROM reaction WHERE user_id = $1 AND comment_id = $2`, [user_id, comment_id]);
          await db.query(
      `DELETE FROM user_interactions WHERE user_id = $1 AND comment_id = $2 AND interaction_type = 'like'`,
      [user_id, comment_id]
    ); 
        return {liked: false}
    }else{
        await db.query<Reaction>(
            `INSERT INTO reaction (user_id, comment_id) VALUES ($1, $2)`, [user_id, comment_id]
        )
          await db.query(
      `INSERT INTO user_interactions (user_id, comment_id, interaction_type) VALUES ($1, $2, 'like')`,
      [user_id, comment_id]
    );
        return {liked: true}
    }   
}

export const getPostLikesCount = async (post_id:string) : Promise<number> =>{
    const res = await db.query(
        `SELECT COUNT(*) AS likes_count FROM reaction WHERE post_id = $1`, [post_id]
    )
    return parseInt(res.rows[0].likes_count, 10)
}

export const getCommentLikesCount  = async (comment_id :string) : Promise<number>=>{
    const res = await db.query(
        `SELECT COUNT(*) AS likes_count FROM reaction WHERE comment_id  = $1`, [comment_id]
    )
    return parseInt(res.rows[0].likes_count, 10)
}
export const getCheckLikedPostDB = async (user_id:string | undefined, postId: string) =>{
    const result = await db.query(`SELECT 1 FROM reaction WHERE user_id= $1 AND post_id = $2`, [user_id, postId]);
    return result.rowCount
}
export const getCheckLikedCommentDB = async (user_id:string | undefined, commentId: string) =>{
    const result = await db.query(`SELECT 1 FROM reaction WHERE user_id= $1 AND comment_id = $2`, [user_id, commentId])
    return result.rowCount
}