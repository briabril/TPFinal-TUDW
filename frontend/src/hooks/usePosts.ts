import { useEffect, useState } from "react"
import api from "@tpfinal/api"
import { Post } from "@tpfinal/types"

export function usePosts(mineOnly: boolean = false) {
    const [posts, setPosts] = useState<Post[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchPosts() {
            try {
                const endpoint = mineOnly ? "/posts/mine" : "/posts"
                const { data } = await api.get<{ data: Post[] }>(endpoint)
                setPosts(data.data || [])
                setError(null)
            } catch (err: any) {
                const msg = err.response?.data?.error || err.message || "Error fetching posts" 
            } finally {
                setLoading(false)
            }
        }

        fetchPosts()
    }, [mineOnly])

    return { posts, error, loading }
}