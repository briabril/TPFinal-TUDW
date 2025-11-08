import { useEffect, useState } from "react"
import api from "@tpfinal/api"
import { Post } from "@tpfinal/types"

export function usePosts(mode: string) {
    const [posts, setPosts] = useState<Post[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if(mode === "mine"){
            
        localStorage.setItem("postsMode", mode)
        }
    }, [mode])



    useEffect(() => {
        async function fetchPosts() {
            console.log("Modo desde hook", mode)

            let endpoint = "/posts"
            try {
                if (mode === "mine") endpoint = "/posts/mine"
                else if (mode === "following") endpoint = "/posts/following"

                console.log("endpoint: ", endpoint)
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

    return { posts, error, loading }
}
