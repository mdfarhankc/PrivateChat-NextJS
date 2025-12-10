import { Elysia } from 'elysia';
import { nanoid } from 'nanoid';
import { z } from "zod";

import { authMiddleware } from './auth';
import { redis } from '@/lib/redis';
import { Message, realtime } from '@/lib/realtime';

const ROOM_TTL_SECONDS = 60 * 10; // Room time to live: 10 minutes

const createEmptyMeta = () => ({
    connected: [],
    createdAt: Date.now(),
});

const rooms = new Elysia({ prefix: "/rooms" })
    // Create room
    .post("/", async () => {
        const roomId = nanoid();
        const metaKey = `meta:${roomId}`;

        await redis.hset(metaKey, createEmptyMeta());
        await redis.expire(metaKey, ROOM_TTL_SECONDS);

        return { roomId };
    })
    .use(authMiddleware)
    // Get Room ttl
    .get("/ttl", async ({ auth }) => {
        const { roomId } = auth;
        const ttl = await redis.ttl(`meta:${roomId}`);
        return { ttl: ttl > 0 ? ttl : 0 }
    }, {
        query: z.object({
            roomId: z.string()
        })
    })
    // Destroy room
    .delete("/", async ({ auth }) => {
        const { roomId } = auth;
        const metaKey = `meta:${roomId}`;
        const messagesKey = `messages:${roomId}`;

        await realtime.channel(roomId).emit("chat.destroy", {
            isDestroyed: true
        });

        await Promise.all([
            redis.del(metaKey),
            redis.del(messagesKey),
        ]);
    }, {
        query: z.object({
            roomId: z.string()
        })
    });

const messages = new Elysia({ prefix: "/messages" })
    .use(authMiddleware)
    // Get messages
    .get("/", async ({ auth }) => {
        const { roomId, token } = auth;
        const messagesKey = `messages:${roomId}`;

        const messages = await redis.lrange<Message>(messagesKey, 0, -1);

        return {
            messages: messages.map((m) => ({
                ...m,
                token: m.token === token ? token : undefined
            })),
        };
    }, {
        query: z.object({
            roomId: z.string()
        })
    })
    // Send message
    .post("/", async ({ body, auth }) => {
        const { sender, text } = body;
        const { roomId, token } = auth;

        const metaKey = `meta:${roomId}`;
        const messagesKey = `messages:${roomId}`;

        const roomExists = await redis.exists(metaKey);
        if (!roomExists) {
            throw new Error("Room does not exist!");
        }

        const message: Message = {
            id: nanoid(),
            sender,
            text,
            timestamp: Date.now(),
            roomId,
            token,
        }

        await redis.rpush(messagesKey, message);
        await realtime.channel(roomId).emit("chat.message", message);

        const remaining = await redis.ttl(`meta:${roomId}`);
        if (remaining > 0) {
            await Promise.all([
                redis.expire(metaKey, remaining),
                redis.expire(messagesKey, remaining),
            ]);
        }
        return { ok: true };
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