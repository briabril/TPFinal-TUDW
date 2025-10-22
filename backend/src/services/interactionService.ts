import redis from "../redis/index";
import db from "../db";
import { Server } from "socket.io";

export async function handleNewInteraction(io: Server, postId: string, authorId: string, type: string) {
  const { rows: followers } = await db.query(
    "SELECT follower_id FROM follow WHERE followee_id = $1",
    [authorId]
  );

  for (const f of followers) {
    await redis.del(`feed:${f.follower_id}`);
    io.to(`user:${f.follower_id}`).emit("feedUpdated", { postId, type });
  }
}
