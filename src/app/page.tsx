"use client";

import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/eden";
import { useRouter } from "next/navigation";

const ANIMALS = ["wolf", "hawk", "bear", "cat"];
const STORAGE_KEY = "chat_username";

const generateUsername = () => {
  const word = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `anonymous-${word}-${nanoid(5)}`;
};

export default function Home() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    const main = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUsername(stored);
        return;
      }

      const generated = generateUsername();
      localStorage.setItem(STORAGE_KEY, generated);
      setUsername(generated);
    };
    main();
  }, []);

  const { mutate: createRoom } = useMutation({
    mutationFn: async () => {
      const response = await api.rooms.post();
      return response.data;
    },
    onSuccess: (data) => {
      router.push(`/room/${data?.roomId}`);
    },
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8">
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
    </main>
  );
}
