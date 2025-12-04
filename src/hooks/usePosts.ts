import { useCallback, useEffect, useRef, useState } from "react"
import api from "../api/index"
import { Post } from "../types/post"

/**
 * usePosts
 * - fetch inicial (replace)
 * - cada 8s polling (merge)
 * - escucha a eventos de ventana para actualizaciones inmediatas
 */
export function usePosts(mode: string, username?: string) {
    const [posts, setPosts] = useState<Post[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    const mountedRef = useRef(true)
    const fetchingRef = useRef(false)

    useEffect(() => {
        mountedRef.current = true
        return () => {
            mountedRef.current = false
        }
    }, [])

    useEffect(() => {
        if (mode === "mine") localStorage.setItem("postsMode", mode)
    }, [mode])

    const getEndpoint = useCallback(() => {
        let endpoint = "/posts/all"
        if (mode === "mine") endpoint = "/posts/mine"
        else if (mode === "following") endpoint = "/posts/following"
        else if (mode === "user" && username) endpoint = `/posts/user/${username}`
        else if (mode === "public-user" && username) endpoint = `/posts/user/${username}?mode=public`
        return endpoint
    }, [mode, username])

    const fetchReplace = useCallback(async () => {
        if (fetchingRef.current) return
        fetchingRef.current = true
        if (mountedRef.current) setLoading(true)
        try {
            const endpoint = getEndpoint()
            // console.log("[usePosts] fetchReplace -> fetching", endpoint)
            const { data } = await api.get<{ data: Post[] }>(endpoint)
            const incoming = data?.data ?? []
            // console.log("[usePosts] fetchReplace -> received", incoming.length, "posts")
            if (!mountedRef.current) return
            setPosts(incoming)
            setError(null)
        } catch (err: any) {
            if (!mountedRef.current) return
            const msg = err?.response?.data?.error || err?.message || "Error loading posts"
            setError(msg)
        } finally {
            if (!mountedRef.current) return
            setLoading(false)
            fetchingRef.current = false
        }
    }, [getEndpoint])

    const fetchMerge = useCallback(async () => {
        if (fetchingRef.current) return
        fetchingRef.current = true
        try {
            const endpoint = getEndpoint()
            // console.log("[usePosts] fetchMerge -> fetching", endpoint)
            const { data } = await api.get<{ data: Post[] }>(endpoint)
            const incoming = data?.data ?? []
            // console.log("[usePosts] fetchMerge -> received", incoming.length, "posts")
            if (!mountedRef.current) return
            // Compara incoming con el anterior para detectar adiciones/eliminaciones, luego reemplaza
            setPosts((prev) => {
                const prevIds = new Set(prev.map((p) => p.id))
                const incomingIds = new Set(incoming.map((p) => p.id))
                const added = incoming.filter((p) => !prevIds.has(p.id)).map((p) => p.id)
                const removed = prev.filter((p) => !incomingIds.has(p.id)).map((p) => p.id)
                if (added.length === 0 && removed.length === 0) {
                    // console.log("[usePosts] fetchMerge -> no changes")
                    return prev
                }
                // if (added.length) console.log("[usePosts] fetchMerge -> added:", added)
                // if (removed.length) console.log("[usePosts] fetchMerge -> removed:", removed)
                return incoming
            })
            setError(null)
        } catch (err: any) {
            if (!mountedRef.current) return
            const msg = err?.response?.data?.error || err?.message || "Error loading posts"
            setError(msg)
        } finally {
            if (!mountedRef.current) return
            fetchingRef.current = false
        }
    }, [getEndpoint])

    // initial replace
    useEffect(() => {
        fetchReplace()
    }, [fetchReplace])

    // polling to merge new posts
    useEffect(() => {
        const interval = setInterval(() => {
            // console.log("[usePosts] poll tick")
            fetchMerge()
        }, 8000)
        return () => clearInterval(interval)
    }, [fetchMerge])

    // window listeners para actualizaciones inmediatas (post creado/eliminado en otra parte de la app)
    useEffect(() => {
        const onCreated = (e: Event) => {
            const detail = (e as CustomEvent).detail as Post | undefined
            // console.log("[usePosts] window post-created", detail?.id)
            if (!detail) return
            setPosts((prev) => (prev.some((p) => p.id === detail.id) ? prev : [detail, ...prev]))
        }

        const onDeleted = (e: Event) => {
            const id = (e as CustomEvent).detail as string | number | undefined
            // console.log("[usePosts] window post-deleted", id)
            if (id === undefined) return
            setPosts((prev) => prev.filter((p) => p.id !== id))
        }

        window.addEventListener("post-created", onCreated)
        window.addEventListener("post-deleted", onDeleted)

        return () => {
            window.removeEventListener("post-created", onCreated)
            window.removeEventListener("post-deleted", onDeleted)
        }
    }, [])

    return { posts, error, loading }
}

export default usePosts
