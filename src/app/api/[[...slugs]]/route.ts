import { redis } from '@/lib/redis';
import { Elysia } from 'elysia';
import { nanoid } from 'nanoid';

const ROOM_TTL_SECONDS = 60 * 10; // Room time to live: 10 minutes

const rooms = new Elysia({ prefix: "/rooms" }).post("/", async () => {
    const roomId = nanoid();
    await redis.hset(`meta:${roomId}`, {
        connected: [],
        createdAt: Date.now(),
    });

    await redis.expire(`meta:${roomId}`, ROOM_TTL_SECONDS);
    console.log("Created a room!");
    return { roomId };
});

const app = new Elysia({ prefix: '/api' })
    .use(rooms);

export type app = typeof app;

export const GET = app.fetch
export const POST = app.fetch 