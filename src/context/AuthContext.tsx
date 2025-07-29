"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"

interface User {
    id: string
    name: string
    email: string
    // add other user fields as needed
}

interface AuthContextType {
    isAuthenticated: boolean
    user: User | null
    loading: boolean
    login: (token: string) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    user: null,
    loading: true,
    login: () => { },
    logout: () => { },
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem("realtivo_token")
        if (token) {
            try {
                const decoded = jwtDecode<User>(token)
                setUser(decoded)
                setIsAuthenticated(true)
            } catch (err) {
                console.error("Invalid token:", err)
                logout()
            }
        }
        setLoading(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const login = (token: string) => {
        localStorage.setItem("realtivo_token", token)
        try {
            const decoded = jwtDecode<User>(token)
            setUser(decoded)
            setIsAuthenticated(true)
        } catch (err) {
            console.error("Invalid token on login:", err)
            logout()
        }
    }

    const logout = () => {
        localStorage.removeItem("realtivo_token")
        setUser(null)
        setIsAuthenticated(false)
        router.push("/login")
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
