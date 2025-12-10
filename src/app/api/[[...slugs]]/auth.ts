import { redis } from "@/lib/redis";
import Elysia from "elysia";

class AuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AuthError"
    }
}

export const authMiddleware = new Elysia({ name: "auth" })
    .error({ AuthError })
    .onError(({ code, set }) => {
        if (code === "AuthError") {
            set.status = 401;
            return { error: "Unauthorized" }
        }
    })
    .derive({ as: "scoped" }, async ({ query, cookie }) => {
        const roomId = query.roomId as string | undefined;
        const authCookie = cookie["x-auth-token"];
        const token = authCookie?.value as string | undefined;

        if (!roomId || !token) {
            throw new AuthError("Missing roomId or token!");
        }

        const metaKey = `meta:${roomId}`;
        const connected = await redis.hget<string[]>(metaKey, "connected");

        if (!connected?.includes(token)) {
            throw new AuthError("Invalid token!");
        }

        return { auth: { roomId, token, connected } };
    });