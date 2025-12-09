import { api } from "@/lib/eden";
import { useQuery } from "@tanstack/react-query";


export const useGetRoomTTL = (roomId: string) => {
    const { data: ttlData, ...query } = useQuery({
        queryKey: ["ttl", roomId],
        queryFn: async () => {
            const response = await api.rooms.ttl.get({ query: { roomId } });
            return response.data;
        },
    });
    return { ttlData, ...query };
}