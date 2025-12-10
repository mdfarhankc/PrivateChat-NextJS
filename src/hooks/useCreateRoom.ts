import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/eden";


export const useCreateRoom = () => {
    const router = useRouter();
    const { mutate: createRoom, ...mutation } = useMutation({
        mutationFn: async () => {
            const response = await api.rooms.post();
            return response.data;
        },
        onSuccess: (data) => {
            if (!data?.roomId) return;
            router.push(`/room/${data.roomId}`);
        },
    });

    return { createRoom, ...mutation };
}