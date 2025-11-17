import { Request, Response } from "express";
import * as FollowModel from "../models/followModel";
import { getUserById } from "../models/userModel";
import { isEitherBlocked } from "../models/blockModel";

async function validateFollowAction(followerId: string, targetId: string) {
  if (!targetId) return { error: "targetId required", code: 400 };
  if (followerId === targetId) return { error: "You can't follow yourself", code: 400 };

  const targetUser = await getUserById(targetId);
  if (!targetUser) return { error: "Target user not found", code: 404 };

  if (await isEitherBlocked(followerId, targetId)) {
    return { error: "You cannot follow this user", code: 403 };
  }

  return { error: null, code: 200 };
}

export async function follow(req: Request, res: Response) {
  try {
    const followerId = (req.user as any)?.id;
    const targetId = req.params.targetId;
    if (!followerId) return res.status(401).json({ message: "Authentication required" });

    const validation = await validateFollowAction(followerId, targetId);
    if (validation.error) return res.status(validation.code).json({ message: validation.error });

    await FollowModel.toggleFollow(followerId, targetId, "follow");
    res.json({ message: "Followed successfully" });
  } catch (err) {
    console.error("follow error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function unfollow(req: Request, res: Response) {
  try {
    const followerId = (req.user as any)?.id;
    const targetId = req.params.targetId;
    if (!followerId) return res.status(401).json({ message: "Authentication required" });

    const validation = await validateFollowAction(followerId, targetId);
    if (validation.error && validation.code !== 403 && validation.code !== 400)
      return res.status(validation.code).json({ message: validation.error });

    await FollowModel.toggleFollow(followerId, targetId, "unfollow");
    res.json({ message: "User unfollowed successfully" });
  } catch (err) {
    console.error("unfollow error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFollowers(req: Request, res: Response) {
  try {
    const userId = req.params.userId || (req.user as any)?.id;
    if (!userId) return res.status(401).json({ message: "Authentication required" });
    const followers = await FollowModel.getFollowRelations(userId, "followers");
    res.json(followers);
  } catch (err) {
    console.error("Error fetching followers:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFollowing(req: Request, res: Response) {
  try {
    const userId = req.params.userId || (req.user as any)?.id;
    if (!userId) return res.status(401).json({ message: "Authentication required" });
    console.log("getFollowing called for userId:", userId);
    const following = await FollowModel.getFollowRelations(userId, "following");
    console.log("getFollowing returning count:", (following || []).length);
    res.json(following);
  } catch (err) {
    console.error("Error fetching following:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFollowStatus(req: Request, res: Response) {
  try {
    const viewerId = (req.user as any)?.id;
    const targetId = req.params.userId;
    if (!viewerId) return res.status(401).json({ message: "Authentication required" });

    if (!targetId) return res.status(400).json({ message: "targetId required" });
    if (viewerId === targetId)
      return res.status(400).json({ message: "Cannot check status with yourself" });

    const targetUser = await getUserById(targetId);
    if (!targetUser) return res.status(404).json({ message: "Target user not found" });

    const status = await FollowModel.getFollowStatus(viewerId, targetId);
    res.json(status);
  } catch (err) {
    console.error("status error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
