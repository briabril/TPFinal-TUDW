import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { VerifyCallback } from "passport-oauth2";
import dotenv from "dotenv";
import db from "../db";
import crypto from "crypto";
import type { User } from "@tpfinal/types";
dotenv.config();



const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (!clientID || !clientSecret) {
  throw new Error("❌ Missing Google OAuth environment variables");
}
passport.use(
  new GoogleStrategy(
    {
      clientID,
      clientSecret,
      callbackURL: "http://localhost:4000/auth/google/callback",
    },
    async (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const picture = profile.photos?.[0]?.value;

        if (!email) return done(new Error("No email returned from Google"), undefined);

        const existing = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (existing.rows.length > 0) return done(null, existing.rows[0]);

        // generar username único
        const baseUsername = email.split("@")[0].slice(0, 30);
        let i = 0;
        let candidate = baseUsername;

        while (true) {
          const { rows } = await db.query("SELECT 1 FROM users WHERE username = $1", [candidate]);
          if (rows.length === 0) break;
          i++;
          candidate = `${baseUsername}${i}`.slice(0, 30);
        }

        const newUser = await db.query(
          `INSERT INTO users (email, username, displayname, profile_picture_url, password_hash)
           VALUES ($1, $2, $3, $4, NULL) RETURNING *`,
          [email, candidate, name, picture]
        );

        return done(null, newUser.rows[0]);
      } catch (err) {
        return done(err as Error, undefined);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  console.log("🔑 Serialize user:", user);
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  console.log("🔑 Deserialize user id:", id);
  try {
    const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    console.log("🔑 Deserialize result:", rows[0]);
    done(null, rows[0] || null);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
