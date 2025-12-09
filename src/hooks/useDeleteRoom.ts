import { api } from "@/lib/eden";
import { useMutation } from "@tanstack/react-query"


export const useDeleteRoom = () => {
    const { mutate: deleteRoom, ...mutation } = useMutation({
        mutationFn: async ({ roomId }: { roomId: string }) => {
            const response = await api.rooms.delete(null, { query: { roomId } });
            return response.data;
        }
    });
    return { deleteRoom, ...mutation };
}