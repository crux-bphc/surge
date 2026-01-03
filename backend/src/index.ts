import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import authRoutes from "./routes/auth";
import accountRoutes from "./routes/account";
import leaderboardRoutes from "./routes/leaderboard";
import profileRoutes from "./routes/profile";
import contestRoutes from "./routes/contest";
import potdRoutes from "./routes/potd";
import wrappedRoutes from "./routes/wrapped";
import { RedisStore } from "connect-redis";
import { createClient } from "redis";
import { client, db } from "./drizzle/db";
import { users } from "./drizzle/schema";
import { eq } from "drizzle-orm";
import { startCronJobs } from "./cron";
import {
  fetchContests,
  fetchProblems,
  fetchSubmissions,
  fetchRatingChanges,
} from "./controllers/codeforces";
import { rateLimit } from "express-rate-limit";
import "./workers/codeforcesWorker";

dotenv.config();
const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env.VITE_CLIENT_URL || "http://localhost:4173",
    credentials: true,
  })
);
app.use(express.json());

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.connect().catch(console.error);
(async () => {
  await client
    .connect()
    .then(() => console.log("Connected to DB successfully"))
    .catch((error) => {
      console.error("Error connecting to db: ", error);
    });
})();

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails![0].value;
        const name = profile.displayName;
        const pfpUrl = profile.photos![0].value;
        const user = await db
          .insert(users)
          .values({ email, name, pfpUrl })
          .onConflictDoUpdate({
            target: users.email,
            set: { name },
          })
          .returning()
          .then((rows) => rows[0]);
        return done(null, user);
      } catch (error) {
        console.error("Error during Google authentication:", error);
        return done(new Error("Authentication failed"));
      }
    }
  )
);

passport.serializeUser((user, done) => {
  const drizzleUser = user as typeof users.$inferSelect;
  done(null, drizzleUser.id);
});

passport.deserializeUser(async (userId: string, done) => {
  // console.log(userId);
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then((rows) => rows[0]);
    done(null, user);
  } catch (error) {
    console.error("Error deserializing user:", error);
    done(new Error("Could not deserialize user"), null);
  }
});

const limiter = rateLimit({
  windowMs: 1000,
  limit: 25,
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
  // store: ... , // Redis, Memcached, etc. See below.
});

app.use(limiter);

app.get("/", (_req, res) => {
  res.send("Backend API is working!");
});

app.use("/auth", authRoutes);
app.use("/account", accountRoutes);
app.use("/leaderboard", leaderboardRoutes);
app.use("/profile", profileRoutes);
app.use("/contest", contestRoutes);
app.use("/potd", potdRoutes);
app.use("/wrapped", wrappedRoutes);
const PORT = parseInt(process.env.BACKEND_PORT || "5000", 10);
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Server running on port ${PORT}`);
  await fetchContests(1);
  await fetchProblems(1);
  if (process.env.VITE_ENV === "production") {
    await fetchSubmissions();
    await fetchRatingChanges();
    startCronJobs();
  }
});
