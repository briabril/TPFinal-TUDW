import { useCallback, useEffect, useRef, useState } from "react";
import api from "../api/index";
import { Post } from "../types/post";
import { useSocket } from "./useSocket";

export function usePosts(mode: string, username?: string, visibility?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);
  const cacheRef = useRef<Record<string, Post[]>>({});

  const { socket, ready } = useSocket();

  const key = `${mode}-${username ?? ""}-${visibility ?? "all"}`;

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const getEndpoint = useCallback(() => {
    if (mode === "mine") return visibility ? `/posts/mine?visibility=${visibility}` : "/posts/mine";
    if (mode === "following") return "/posts/following";
    if (mode === "user" && username) return `/posts/user/${username}`;
    if (mode === "public-user" && username) return `/posts/user/${username}?mode=public`;
    return "/posts/all";
  }, [mode, username, visibility]);

  const fetchReplace = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    setLoading(true);

    try {
      if (cacheRef.current[key]) {
        setPosts(cacheRef.current[key]);
        setLoading(false);
        fetchingRef.current = false;
        return;
      }

      const { data } = await api.get<{ data: Post[] }>(getEndpoint());
      const incoming = data.data ?? [];
      if (!mountedRef.current) return;

      setPosts(incoming);
      cacheRef.current[key] = incoming;
      setError(null);
    } catch (err: any) {
      if (!mountedRef.current) return;
      setError(err?.response?.data?.error || err.message);
    } finally {
      loading && setLoading(false);
      fetchingRef.current = false;
    }
  }, [getEndpoint, key]);

  const fetchMerge = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const { data } = await api.get<{ data: Post[] }>(getEndpoint());
      const incoming = data.data ?? [];
      if (!mountedRef.current) return;

      setPosts(prev => {
        const prevIds = new Set(prev.map(p => p.id));
        const incomingIds = new Set(incoming.map(p => p.id));

        const added = incoming.filter(p => !prevIds.has(p.id));
        const removed = prev.filter(p => !incomingIds.has(p.id));

        if (!added.length && !removed.length) return prev;
        cacheRef.current[key] = incoming;
        return incoming;
      });
    } catch (err: any) {
      if (mountedRef.current) setError(err?.response?.data?.error || err.message);
    } finally {
      fetchingRef.current = false;
    }
  }, [getEndpoint, key]);

  useEffect(() => { fetchReplace(); }, [fetchReplace]);
  useEffect(() => {
    const interval = setInterval(fetchMerge, 8000);
    return () => clearInterval(interval);
  }, [fetchMerge]);

  useEffect(() => {
    if (!ready || !socket.current) return;

    const s = socket.current;

    const handleNew = (newPost: Post) => {
      setPosts(prev => {
        if (prev.some(p => p.id === newPost.id)) return prev;
        const list = [newPost, ...prev];
        cacheRef.current[key] = list;
        return list;
      });
    };

    const handleUpdate = (updated: Post) => {
      setPosts(prev => {
        const list = prev.map(p => p.id === updated.id ? updated : p);
        cacheRef.current[key] = list;
        return list;
      });
    };

    const handleDelete = (id: string | number) => {
      setPosts(prev => {
        const list = prev.filter(p => p.id !== id);
        cacheRef.current[key] = list;
        return list;
      });
    };

    s.on("new-post", handleNew);
    s.on("update-post", handleUpdate);
    s.on("delete-post", handleDelete);

    return () => {
      s.off("new-post", handleNew);
      s.off("update-post", handleUpdate);
      s.off("delete-post", handleDelete);
    };
  }, [socket, ready, key]);

  return { posts, error, loading };
}

export default usePosts;
