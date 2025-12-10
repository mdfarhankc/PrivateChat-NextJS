"use client";

import { useUsername } from "@/hooks/useUsername";
import { useCreateRoom } from "@/hooks/useCreateRoom";

interface HomeClientProps {
  error?: string;
}

export default function HomeClient({ error }: HomeClientProps) {
  const { username } = useUsername();
  const { createRoom } = useCreateRoom();

  return (
    <div className="w-full max-w-md space-y-8">
      {error === "room-not-found" && (
        <div className="bg-red-900/50 border border-red-900 p-4 text-center">
          <p className="text-red-500 text-sm font-bold">ROOM NOT FOUND</p>
          <p className="text-zinc-500 text-xs mt-1">
            This room may have expired or never existed.
          </p>
        </div>
      )}
      {error === "room-full" && (
        <div className="bg-red-900/50 border border-red-900 p-4 text-center">
          <p className="text-red-500 text-sm font-bold">ROOM FULL</p>
          <p className="text-zinc-500 text-xs mt-1">
            This room is at maximum capacity.
          </p>
        </div>
      )}
      {/* Main Heading */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-green-500">
          {">"}private_chat
        </h1>
        <p className="text-sm text-zinc-100">
          A private,self-destructing chat room.
        </p>
      </div>
      {/* Enter room box */}
      <div className="border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-md">
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="flex items-center text-zinc-500">
              Your identity
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-zinc-950 border-zinc-800 p-3 text-sm text-zinc-400 font-mono">
                {username}
              </div>
            </div>
          </div>
          <button
            onClick={() => createRoom()}
            className="w-full bg-zinc-100 text-black p-3 text-sm font-bold hover:bg-zinc-50 hover:text-black transition-colors mt-2 cursor-pointer disabled:opacity-50"
          >
            Create Secure Room
          </button>
        </div>
      </div>
    </div>
  );
}
