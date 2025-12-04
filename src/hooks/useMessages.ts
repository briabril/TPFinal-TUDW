"use client";

import { useEffect, useState } from "react";
import api from "@/api";
import { useSocket } from "@/hooks/useSocket";

export function useMessages(userId: string | null) {
    const [unread, setUnread] = useState(0);
    const { socket, ready } = useSocket(); // ← ahora tomamos estas dos cosas

    // Cargar cantidad inicial de mensajes no leídos
    useEffect(() => {
        if (!userId) return;

        async function loadUnread() {
            try {
                const res = await api.get("/messages/unread-count", {
                    withCredentials: true,
                });
                setUnread(res.data.unread || 0);
            } catch (e) {
                console.log("Error loading unread count:", e);
            }
        }

        loadUnread();
    }, [userId]);

    // Listener de sockets (solo cuando ready === true)
    useEffect(() => {
        if (!ready) return;              // <-- esperamos que el socket esté listo
        if (!socket.current) return;     // <-- evitamos undefined
        if (!userId) return;

        const s = socket.current;

        // Eliminamos listeners viejos antes de agregar los nuevos
        s.off("dm_message");
        s.off("dm_seen");

        const onMessage = async (msg: any) => {
            if (msg?.to === userId) {
                try {
                    const res = await api.get("/messages/unread-count", {
                        withCredentials: true,
                    });
                    setUnread(res.data.unread);
                } catch (err) {
                    console.error("Error updating unread:", err);
                }
            }
        };

        const onSeen = async (data: any) => {
            if (data.userId === userId) {
                try {
                    const res = await api.get("/messages/unread-count", {
                        withCredentials: true,
                    });
                    setUnread(res.data.unread);
                } catch (err) {
                    console.error("Error updating unread:", err);
                }
            }
        };

        // Registramos listeners
        s.on("dm_message", onMessage);
        s.on("dm_seen", onSeen);

        // Cleanup
        return () => {
            s.off("dm_message", onMessage);
            s.off("dm_seen", onSeen);
        };
    }, [ready, socket, userId]);

    // Marcar conversación como leída
    const markConversationAsRead = async (conversationId: string) => {
        try {
            await api.post(
                "/messages/mark-read",
                { conversationId },
                { withCredentials: true }
            );

            const refresh = await api.get("/messages/unread-count", {
                withCredentials: true,
            });
            setUnread(refresh.data.unread);
        } catch (err) {
            console.error("Error marking read:", err);
        }
    };

    return { unread, setUnread, markConversationAsRead };
}
