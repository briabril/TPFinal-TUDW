'use client'

import { Spinner } from "@heroui/spinner"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Unauthorized() {
    const router = useRouter()

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push("/")
        }, 5000)
    })

    return (
        <div className="p-8 text-center">
            <h1 className="text-2xl font-bold">Acceso denegado</h1>
            <p>No tienes permisos para ver esta página</p>
            <Spinner color="danger" label="Danger" labelColor="danger" />
        </div>
    )
}