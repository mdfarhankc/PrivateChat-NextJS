import { redis } from '@/lib/redis';
import { Elysia } from 'elysia';
import { nanoid } from 'nanoid';
import { z } from "zod";
import { authMiddleware } from './auth';
import { Message, realtime } from '@/lib/realtime';

const ROOM_TTL_SECONDS = 60 * 10; // Room time to live: 10 minutes

const rooms = new Elysia({ prefix: "/rooms" })
    .post("/", async () => {
        const roomId = nanoid();
        await redis.hset(`meta:${roomId}`, {
            connected: [],
            createdAt: Date.now(),
        });

        await redis.expire(`meta:${roomId}`, ROOM_TTL_SECONDS);
        console.log("Created a room!");
        return { roomId };
    })
    .use(authMiddleware)
    .get("/ttl", async ({ auth }) => {
        const { roomId } = auth;
        const ttl = await redis.ttl(`meta:${roomId}`);
        return { ttl: ttl > 0 ? ttl : 0 }
    }, {
        query: z.object({
            roomId: z.string()
        })
    })
    .delete("/", async ({ auth }) => {
        const { roomId } = auth;
        await realtime.channel(roomId).emit("chat.destroy", {
            isDestroyed: true
        });
        await Promise.all([
            redis.del(roomId),
            redis.del(`meta:${roomId}`),
            redis.del(`messages:${roomId}`),
        ]);
    }, {
        query: z.object({
            roomId: z.string()
        })
    });

const messages = new Elysia({ prefix: "/messages" })
    .use(authMiddleware)
    .get("/", async ({ auth }) => {
        const { roomId, token } = auth;
        const messages = await redis.lrange<Message>(`messages:${roomId}`, 0, -1);

        return {
            messages: messages.map((m) => ({
                ...m,
                token: m.token === token ? token : undefined
            })),
        };
    }, { query: z.object({ roomId: z.string() }) })
    .post("/", async ({ body, auth }) => {
        const { sender, text } = body;
        const { roomId } = auth;
        const roomExists = await redis.exists(`meta:${roomId}`);

        if (!roomExists) {
            throw new Error("Room does not exists!");
        }

        const message: Message = {
            id: nanoid(),
            sender,
            text,
            timestamp: Date.now(),
            roomId,
        }

        await redis.rpush(`messages:${roomId}`, {
            ...message, token: auth.token
        });

        await realtime.channel(roomId).emit("chat.message", message);

        const remaining = await redis.ttl(`meta:${roomId}`);

        await Promise.all([
            redis.expire(`messages:${roomId}`, remaining),
            redis.expire(roomId, remaining),
        ]);



    }, {
        body: z.object({
            sender: z.string().max(100),
            text: z.string().max(500),
        })
    });

const app = new Elysia({ prefix: '/api' })
    .use(rooms)
    .use(messages);

export type app = typeof app;

export const GET = app.fetch
export const POST = app.fetch
export const DELETE = app.fetch 