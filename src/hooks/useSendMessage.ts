import { api } from "@/lib/eden";
import { useMutation } from "@tanstack/react-query";



export const useSendMessages = (roomId: string) => {
    const { mutate: sendMessage, ...mutation } = useMutation({
        mutationFn: async ({ text, username }: { username: string, text: string }) => {
            await api.messages.post(
                { sender: username, text },
                { query: { roomId } }
            );
        },
    });
    return { sendMessage, ...mutation };
}