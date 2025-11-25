import { useEffect, useState } from "react"
import api from "../api/index"
import { Post } from "../types/post"
import socket from "@/socket"

export function usePosts(mode: string, username?: string) {
    const [posts, setPosts] = useState<Post[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if(mode === "mine"){
            
        localStorage.setItem("postsMode", mode)
        }
    }, [mode, username])



    useEffect(() => {
        async function fetchPosts() {

            let endpoint = "/posts"
            try {
                if (mode === "mine") endpoint = "/posts/mine"
                else if (mode === "following") endpoint = "/posts/following"
                 else if (mode === "user" && username)
    endpoint = `/posts/user/${username}`;
                const { data } = await api.get<{ data: Post[] }>(endpoint)

                setPosts(data.data || [])
                setError(null)
            } catch (err: any) {
                const msg = err.response?.data?.error || err.message || "Error fetching posts"
                setError(msg)
            } finally {
                setLoading(false)
            }
        }

        fetchPosts()
    }, [mode])

    useEffect(() => {
        const handleNewPost = (newPost: Post) => {
            setPosts((prev) => {
                // evita duplicados
                if (prev.find((p) => p.id === newPost.id)) return prev
                return [newPost, ...prev]
            })
        }

        const handleUpdatePost = (updated: Post) => {
            setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        }

        const handleDeletePost = (id: string | number) => {
            setPosts((prev) => prev.filter((p) => p.id !== id))
        }

        try {
            socket.on("new-post", handleNewPost)
            socket.on("update-post", handleUpdatePost)
            socket.on("delete-post", handleDeletePost)
        } catch (e) {
        }

        const windowNew = (e: Event) => {
            const detail = (e as CustomEvent).detail as Post | undefined
            if (detail) handleNewPost(detail)
        }
            const windowDelete = (e: Event) => {
                const id = (e as CustomEvent).detail as string | number | undefined
                if (id) handleDeletePost(id)
            }

        window.addEventListener("post-created", windowNew as EventListener)
            window.addEventListener("post-deleted", windowDelete as EventListener)

        return () => {
            try {
                socket.off("new-post", handleNewPost)
                socket.off("update-post", handleUpdatePost)
                socket.off("delete-post", handleDeletePost)
            } catch (e) {}
            window.removeEventListener("post-created", windowNew as EventListener)
                window.removeEventListener("post-deleted", windowDelete as EventListener)
        }
    }, [])

    return { posts, error, loading }
}
