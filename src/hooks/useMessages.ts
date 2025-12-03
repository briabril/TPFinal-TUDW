"use client";

import { useEffect, useState } from "react";
import api from "@/api";
import { useSocket } from "@/hooks/useSocket";

export function useMessages(userId: string | null) {
    const [unread, setUnread] = useState(0);
    const socket = useSocket();

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

    useEffect(() => {
        if (!socket.current || !userId) return;

        const onMessage = async (msg: any) => {
            if (msg?.to === userId) {
                const res = await api.get("/messages/unread-count", {
                    withCredentials: true,
                });
                setUnread(res.data.unread);
            }
        };

        const onSeen = async (data: any) => {
            if (data.userId === userId) {
                const res = await api.get("/messages/unread-count", {
                    withCredentials: true,
                });
                setUnread(res.data.unread);
            }
        };

        socket.current.on("dm_message", onMessage);
        socket.current.on("dm_seen", onSeen);

        return () => {
            socket.current?.off("dm_message", onMessage);
            socket.current?.off("dm_seen", onSeen);
        };
    }, [socket, userId]);

    const markConversationAsRead = async (conversationId: string) => {
        try {
            await api.post("/messages/mark-read",
                { conversationId },
                { withCredentials: true }
            );

            const refresh = await api.get("/messages/unread-count");
            setUnread(refresh.data.unread);
        } catch (err) {
            console.error("Error marking read:", err);
        }
    };

    return { unread, setUnread, markConversationAsRead };
}
