import { useEffect, useState } from "react"
import api from "../api/index"
import { Post } from "../types/post"
import { useSocket } from "./useSocket"

export function usePosts(mode: string, username?: string) {
    const [posts, setPosts] = useState<Post[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    const socketRef = useSocket()

    useEffect(() => {
        if (mode === "mine") {
            localStorage.setItem("postsMode", mode)
        }
    }, [mode])

    useEffect(() => {
        async function fetchPosts() {
            let endpoint = "/posts/all"

            if (mode === "mine") {
                endpoint = "/posts/mine"
            } else if (mode === "following") {
                endpoint = "/posts/following"
            } else if (mode === "user" && username) {
                endpoint = `/posts/user/${username}`
            } else if (mode === "public-user" && username) {
                endpoint = `/posts/user/${username}?mode=public`
            }

            setLoading(true)
            try {
                const { data } = await api.get<{ data: Post[] }>(endpoint)
                setPosts(data.data || [])
                setError(null)
            } catch (err: any) {
                const msg = err.response?.data?.error || err.message
                setError(msg)
            } finally {
                setLoading(false)
            }
        }

        fetchPosts()
    }, [mode, username])

    useEffect(() => {
        const socket = socketRef.current
        if (!socket) return

        const handleNewPost = (newPost: Post) => {
            setPosts((prev) =>
                prev.some((p) => p.id === newPost.id)
                    ? prev
                    : [newPost, ...prev]
            )
        }

        const handleUpdatePost = (updated: Post) => {
            setPosts((prev) => prev.map((p) =>
                p.id === updated.id ? updated : p
            ))
        }

        const handleDeletePost = (id: string | number) => {
            setPosts((prev) => prev.filter((p) => p.id !== id))
        }

        socket.on("new-post", handleNewPost)
        socket.on("update-post", handleUpdatePost)
        socket.on("delete-post", handleDeletePost)

        const windowNew = (e: Event) => {
            const detail = (e as CustomEvent).detail as Post
            if (detail) handleNewPost(detail)
        }
        const windowDelete = (e: Event) => {
            const id = (e as CustomEvent).detail as string | number
            if (id) handleDeletePost(id)
        }

        window.addEventListener("post-created", windowNew)
        window.addEventListener("post-deleted", windowDelete)

        return () => {
            socket.off("new-post", handleNewPost)
            socket.off("update-post", handleUpdatePost)
            socket.off("delete-post", handleDeletePost)

            window.removeEventListener("post-created", windowNew)
            window.removeEventListener("post-deleted", windowDelete)
        }
    }, [socketRef.current])
    return { posts, error, loading }
}
