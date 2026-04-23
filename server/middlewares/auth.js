import { clerkClient } from "@clerk/express";

// ─── Simple per-userId promise-deduplication cache ────────────────────────────
// Prevents multiple simultaneous requests from each firing their own Clerk API call.
const userCache = new Map();          // userId → { user, ts }
const inflightMap = new Map();        // userId → Promise  (dedup concurrent requests)
const CACHE_TTL_MS = 5 * 60 * 1000;  // 5 minutes

export const invalidateUserCache = (userId) => {
    userCache.delete(userId);
    inflightMap.delete(userId);
};

export const getCachedUser = async (userId) => {
    // 1. Serve from cache if still fresh
    const cached = userCache.get(userId);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
        return cached.user;
    }

    // 2. If a request for this userId is already in-flight, wait for it (dedup)
    if (inflightMap.has(userId)) {
        return inflightMap.get(userId);
    }

    // 3. Fire a new request and register it as in-flight
    const promise = clerkClient.users.getUser(userId)
        .then((user) => {
            userCache.set(userId, { user, ts: Date.now() });
            inflightMap.delete(userId);
            return user;
        })
        .catch((err) => {
            inflightMap.delete(userId);
            throw err;
        });

    inflightMap.set(userId, promise);
    return promise;
};

// ─── Auth middleware ──────────────────────────────────────────────────────────
// Lightweight: only verifies the JWT (local, no API call) and sets req.userId.
// Plan/usage is fetched lazily by controllers that need it via getCachedUser().
export const auth = async (req, res, next) => {
    try {
        const authData = await req.auth();
        const userId = authData?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        req.userId = userId;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};