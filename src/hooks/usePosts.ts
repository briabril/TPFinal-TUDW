import { useCallback, useEffect, useRef, useState } from "react";
import api from "../api/index";
import { Post } from "../types/post";
import { useSocket } from "./useSocket";

/**
 * usePosts unificado:
 *  - fetch inicial (replace)
 *  - polling cada 8s (merge)
 *  - cache interno por clave
 *  - sockets: new, update, delete
 *  - window events: post-created / post-deleted
 *  - soporta visibility en "mine"
 */
export function usePosts(mode: string, username?: string, visibility?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);
  const cacheRef = useRef<Record<string, Post[]>>({});

  const socketRef = useSocket();

  // Clave única
  const key = `${mode}-${username ?? ""}-${visibility ?? "all"}`;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /** Endpoint dinámico */
  const getEndpoint = useCallback(() => {
    if (mode === "mine") {
      return visibility ? `/posts/mine?visibility=${visibility}` : "/posts/mine";
    }
    if (mode === "following") return "/posts/following";
    if (mode === "user" && username) return `/posts/user/${username}`;
    if (mode === "public-user" && username)
      return `/posts/user/${username}?mode=public`;

    return "/posts/all";
  }, [mode, username, visibility]);

  /** FETCH: Replace */
  const fetchReplace = useCallback(async () => {
    if (fetchingRef.current) return;

    fetchingRef.current = true;

    setLoading(true);

    try {
      // Si está en caché → usarlo
      if (cacheRef.current[key]) {
        setPosts(cacheRef.current[key]);
        setLoading(false);
        fetchingRef.current = false;
        return;
      }

      const endpoint = getEndpoint();
      const { data } = await api.get<{ data: Post[] }>(endpoint);
      const incoming = data.data ?? [];

      if (!mountedRef.current) return;

      setPosts(incoming);
      cacheRef.current[key] = incoming;
      setError(null);
    } catch (err: any) {
      if (!mountedRef.current) return;
      setError(err?.response?.data?.error || err.message);
    } finally {
      if (mountedRef.current) setLoading(false);
      fetchingRef.current = false;
    }
  }, [getEndpoint, key]);

  /** FETCH: Merge (comparar cambios) */
  const fetchMerge = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const endpoint = getEndpoint();
      const { data } = await api.get<{ data: Post[] }>(endpoint);
      const incoming = data.data ?? [];

      if (!mountedRef.current) return;

      setPosts((prev) => {
        const prevIds = new Set(prev.map((p) => p.id));
        const incomingIds = new Set(incoming.map((p) => p.id));

        const added = incoming.filter((p) => !prevIds.has(p.id));
        const removed = prev.filter((p) => !incomingIds.has(p.id));

        if (added.length === 0 && removed.length === 0) return prev;

        cacheRef.current[key] = incoming;
        return incoming;
      });
    } catch (err: any) {
      if (!mountedRef.current) return;
      setError(err?.response?.data?.error || err.message);
    } finally {
      fetchingRef.current = false;
    }
  }, [getEndpoint, key]);

  /** Initial fetch */
  useEffect(() => {
    fetchReplace();
  }, [fetchReplace]);

  /** Polling cada 8s */
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMerge();
    }, 8000);

    return () => clearInterval(interval);
  }, [fetchMerge]);

  /** WINDOWS EVENTS: created / deleted */
  useEffect(() => {
    const onCreated = (e: Event) => {
      const newPost = (e as CustomEvent).detail as Post;
      if (!newPost) return;

      setPosts((prev) => {
        if (prev.some((p) => p.id === newPost.id)) return prev;
        const newList = [newPost, ...prev];
        cacheRef.current[key] = newList;
        return newList;
      });
    };

    const onDeleted = (e: Event) => {
      const id = (e as CustomEvent).detail as string | number;
      if (!id) return;

      setPosts((prev) => {
        const newList = prev.filter((p) => p.id !== id);
        cacheRef.current[key] = newList;
        return newList;
      });
    };

    window.addEventListener("post-created", onCreated);
    window.addEventListener("post-deleted", onDeleted);

    return () => {
      window.removeEventListener("post-created", onCreated);
      window.removeEventListener("post-deleted", onDeleted);
    };
  }, [key]);

  /** SOCKETS */
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleNew = (newPost: Post) => {
      setPosts((prev) => {
        if (prev.some((p) => p.id === newPost.id)) return prev;

        const newList = [newPost, ...prev];
        cacheRef.current[key] = newList;
        return newList;
      });
    };

    const handleUpdate = (updated: Post) => {
      setPosts((prev) => {
        const newList = prev.map((p) => (p.id === updated.id ? updated : p));
        cacheRef.current[key] = newList;
        return newList;
      });
    };

    const handleDelete = (id: string | number) => {
      setPosts((prev) => {
        const newList = prev.filter((p) => p.id !== id);
        cacheRef.current[key] = newList;
        return newList;
      });
    };

    socket.on("new-post", handleNew);
    socket.on("update-post", handleUpdate);
    socket.on("delete-post", handleDelete);

    return () => {
      socket.off("new-post", handleNew);
      socket.off("update-post", handleUpdate);
      socket.off("delete-post", handleDelete);
    };
  }, [key, socketRef]);

  return { posts, error, loading };
}

export default usePosts;
