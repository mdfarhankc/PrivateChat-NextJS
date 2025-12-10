# PrivateChat-NextJS

A self-destructing, anonymous private chat application built with **Next.js 16**, **Elysia**, **Upstash Redis**, and **Upstash Realtime**.  
Each chat room is limited to two participants and automatically deletes itself after a fixed TTL (10 minutes).

---

## 🚀 Features

- Anonymous chat with auto-generated username  
- Private 1-on-1 chat rooms  
- Self-destructing rooms with Redis TTL  
- Real-time messaging via Upstash Realtime  
- Lightweight serverless backend (Elysia)  
- Zero DB setup — Redis only  
- Clean separation: SSR for initial data, CSR for realtime  

---

## 🧰 Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS  
- **Backend API:** Elysia running inside Next.js Route Handlers  
- **Storage:** Upstash Redis (TTL-driven room + messages)  
- **Realtime:** Upstash Realtime for event broadcasting  
- **Other Tools:** TypeScript, nanoid, zod, date-fns  

---

## 📁 Folder Structure (Simplified)

```
/src
    /app
    ├── layout.tsx
    ├── page.tsx
    └── room/[roomId]/
            ├── page.tsx       — server component (initial load)
            └── RoomClient.tsx — realtime chat UI

    /app/api
    ├── [...slugs]/         — room creation, TTL, destroy, messages list, send message (Entire Elysia api code)
    └── realtime/           — Api for upstash realtime

    /hooks                  — All the react query hooks simplified
    /lib
    └── eden.ts             — typed Elysia client
    ├── realtime-client.ts  — Upstash Realtime client
    ├── realtime.ts         — Upstash Realtime setup
    ├── redis.ts            — Upstash Redis client
    └── utils.ts            — Utility functions 

/proxy.ts           — token assignment & room capacity logic
```

---

## ✅ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/mdfarhankc/PrivateChat-NextJS
cd PrivateChat-NextJS
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env.local`

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000"
UPSTASH_REDIS_REST_URL="your_url"
UPSTASH_REDIS_REST_TOKEN="your_token"
```

### 4. Run locally

```bash
npm run dev
```

App runs at:

```
http://localhost:3000
```

---

## ⚙️ How It Works

### 1. Home Page
- User sees an auto-generated username
- Can create a new private chat room

### 2. Room Creation
`POST /api/rooms`  
- Generates roomId  
- Creates metadata in Redis  
- Sets TTL = 10 minutes  

### 3. Joining a Room
- Middleware assigns a per-room token  
- Ensures max 2 users per room  
- Stores connected users in Redis  

### 4. Chat Flow
- Initial messages + TTL fetched via SSR  
- Client subscribes to Upstash Realtime  
- Sending message pushes to Redis + emits realtime event  
- All clients append message instantly  
- No refetching needed  

### 5. Auto-Destruct
- Redis TTL destroys room metadata + messages  
- Client receives `chat.destroy` event  
- Automatically redirects to home  

---

## 📦 Deployment

Works seamlessly on:

- **Vercel**
- **Netlify**
- **Any serverless environment**

Steps:

1. Push project to GitHub  
2. Connect to Vercel  
3. Add Upstash Redis environment variables  
4. Deploy  

---

## 🛠 Customization Ideas

- Change room TTL (default 10 minutes)  
- Allow more than 2 participants  
- Add typing indicator via Realtime  
- Add room passwords  
- Add message encryption  
- Persist chat instead of ephemeral TTL  

---

## ⚠️ Notes

- Entire room + messages are deleted when TTL expires  
- No authentication system — fully anonymous  
- Token cookie identifies user per room  
- Closing tab does not reset user's token  

---

## 📄 License

MIT License.  
Feel free to modify and use for learning or production.
