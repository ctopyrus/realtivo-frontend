"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/login")
        }
    }, [isAuthenticated, loading, router])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-gray-600">Checking authentication...</p>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null // Prevent content flash while redirecting
    }

    return <>{children}</>
}
