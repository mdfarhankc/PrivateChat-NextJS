"use client";

import { useUsername } from "@/hooks/useUsername";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useMemo } from "react";
import { format } from "date-fns";
import { useRealtime } from "@/lib/realtime-client";
import { useGetMessages } from "@/hooks/useGetMessages";
import { useSendMessages } from "@/hooks/useSendMessage";
import { useGetRoomTTL } from "@/hooks/useGetRoomTTL";
import { useDeleteRoom } from "@/hooks/useDeleteRoom";

const formatTimeRemaining = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const { username } = useUsername();
  const roomId = params.roomId as string;
  const [copyStatus, setCopyStatus] = useState("COPY");
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopyStatus("COPIED");
    setTimeout(() => {
      setCopyStatus("COPY");
    }, 2000);
  };

  const { ttlData } = useGetRoomTTL(roomId);
  const { messages, refetch } = useGetMessages(roomId);
  const { sendMessage, isPending } = useSendMessages(roomId);
  const { deleteRoom } = useDeleteRoom();

  const [displayTime, setDisplayTime] = useState<number | null>(null);

  const timeRemaining = useMemo(
    () => (ttlData?.ttl !== undefined ? ttlData.ttl : null),
    [ttlData?.ttl]
  );

  useEffect(() => {
    setDisplayTime(timeRemaining);
  }, [timeRemaining]);

  useEffect(() => {
    if (displayTime === null || displayTime < 0) return;
    if (displayTime === 0) {
      router.replace("/?destroyed=true");
      return;
    }

    const interval = setInterval(() => {
      setDisplayTime((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
    }, 1000);

    return () => clearInterval(interval);
  }, [displayTime, router]);

  const onSend = () => {
    sendMessage({ username, text: input });
    inputRef.current?.focus();
    setInput("");
  };

  useRealtime({
    channels: [roomId],
    events: ["chat.message", "chat.destroy"],
    onData: ({ event }) => {
      if (event === "chat.message") {
        refetch();
      } else if (event === "chat.destroy") {
        router.replace("/?destroyed=true");
      }
    },
  });

  return (
    <main className="flex flex-col min-h-screen max-h-screen overflow-hidden">
      <header className="border-b border-zinc-800 p-4 flex items-center justify-between bg-zinc-900/30">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500 uppercase">Room ID</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-green-500">{roomId}</span>
              <button
                onClick={copyLink}
                className="text-[10px] bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                {copyStatus}
              </button>
            </div>
          </div>
          {/* Seperator */}
          <div className="h-8 w-px bg-zinc-800" />
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500 uppercase">
              Self-descruct
            </span>
            <span
              className={`text-xm font-bold flex items-center gap-2 ${
                displayTime !== null && displayTime < 60
                  ? "text-red-500"
                  : "text-amber-500"
              }`}
            >
              {displayTime !== null
                ? formatTimeRemaining(displayTime)
                : "--:--"}
            </span>
          </div>
        </div>
        <button
          onClick={() => deleteRoom({ roomId })}
          className="text-xs bg-zinc-800 hover:bg-red-600 px-3 py-1.5 rounded text-zinc-400 hover:text-white font-bold transition-all group flex items-center gap-2 disabled:opacity-50"
        >
          {" "}
          <span className="group-hover:animate-pulse">💣</span> Destroy Now
        </button>
      </header>
      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages?.messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-zinc-600 text-sm font-mono">
              No messages yet, start the conversation.
            </p>
          </div>
        )}
        {messages?.messages.map((message) => (
          <div key={message.id} className="flex flex-col items-start">
            <div className="max-w-[80%] group">
              <div className="flex items-baseline gap-3 mb-1">
                <span
                  className={`text-xs font-bold ${
                    message.sender === username
                      ? "text-green-500"
                      : "text-blue-500"
                  }`}
                >
                  {message.sender === username ? "YOU" : message.sender}
                </span>
                <span className="text-[10px] text-zinc-600">
                  {format(message.timestamp, "HH:mm")}
                </span>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed break-all">
                {message.text}
              </p>
            </div>
          </div>
        ))}
      </div>
      {/* Input */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
        <div className="flex gap-4">
          <div className="flex-1 relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 animate-pulse">
              {">"}
            </span>
            <input
              type="text"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input.trim()) {
                  onSend();
                }
              }}
              placeholder="Type Message ..."
              className="w-full bg-black border border-zinc-800 focus:border-zinc-700 focus:outline-none transition-colors text-zinc-100 placeholder:text-zinc-700 py-3 pl-8 pr-4 text-sm"
              autoFocus
            />
          </div>
          <button
            onClick={onSend}
            disabled={!input.trim() || isPending}
            className="bg-zinc-800 text-zinc-400 px-6 text-sm font-bold hover:text-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            SEND
          </button>
        </div>
      </div>
    </main>
  );
}
