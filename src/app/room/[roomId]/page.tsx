import { Metadata } from "next";
import RoomClient from "./RoomClient";

interface RoomPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export const metadata: Metadata = {
  title: "Private Room",
  description: "Enjoy chatting privately for 10 minutes.",
};

export default async function RoomPage({ params }: RoomPageProps) {
  const roomId = (await params).roomId;
  return <RoomClient roomId={roomId} />;
}
