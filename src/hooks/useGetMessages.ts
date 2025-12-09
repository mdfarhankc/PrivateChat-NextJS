import { api } from "@/lib/eden";
import { useQuery } from "@tanstack/react-query";



export const useGetMessages = (roomId: string) => {
    const { data: messages, ...query } = useQuery({
        queryKey: ["messages", roomId],
        queryFn: async () => {
            const response = await api.messages.get({ query: { roomId } });
            return response.data;
        },
    });
    return { messages, ...query }
}