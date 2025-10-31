import { Request, Response } from "express";
import axios from "axios";

function getUnsplashKey() {
  const k = process.env.UNSPLASH_ACCESS_KEY;
  if (!k) throw new Error("UNSPLASH_ACCESS_KEY not set");
  return k;
}

// Simple in-memory cache to avoid hitting Unsplash too often (key -> {url, expiresAt})
const cache = new Map<string, { url: string; expiresAt: number }>();

export const getPhoto = async (req: Request, res: Response) => {
  try {
    const { query = "weather", orientation = "landscape" } = req.query as any;
    const q = String(query || "weather").trim();

    // serve from cache if fresh
    const cached = cache.get(q);
    const now = Date.now();
    if (cached && cached.expiresAt > now) {
      return res.json({ url: cached.url, cached: true });
    }

    const key = getUnsplashKey();

    // Use Unsplash random photo endpoint to get a contextual image
    const url = `https://api.unsplash.com/photos/random`;
    const params: any = { query: q, orientation };
    const headers = { Authorization: `Client-ID ${key}` };

    const r = await axios.get(url, { params, headers });
    const data = r.data;
    const photoUrl = data?.urls?.regular || data?.urls?.full || data?.urls?.raw;

    if (!photoUrl) return res.status(502).json({ error: "No image returned by Unsplash" });

    // cache for 10 minutes
    cache.set(q, { url: photoUrl, expiresAt: now + 1000 * 60 * 10 });

    return res.json({ url: photoUrl, cached: false });
  } catch (err: any) {
    console.error("getPhoto error:", err?.response?.data || err.message || err);
    res.status(500).json({ error: "Error fetching photo" });
  }
};

export default { getPhoto };
