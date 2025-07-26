"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/types/user"

interface AuthContextType {
    user: User | null
    setUser: (user: User | null) => void
    setToken: (token: string | null) => void
    token: string | null
    login: (token: string, user: User) => void
    logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider")
    }
    return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null)
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const savedToken = localStorage.getItem("token")
        const savedUser = localStorage.getItem("user")

        if (savedToken) {
            setToken(savedToken)
        }
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser))
            } catch (err) {
                console.error("Error parsing saved user:", err)
                setUser(null)
            }
        }
    }, [])

    const login = (newToken: string, userInfo: User) => {
        setToken(newToken)
        setUser(userInfo)
        localStorage.setItem("token", newToken)
        localStorage.setItem("user", JSON.stringify(userInfo))
    }

    const logout = () => {
        setToken(null)
        setUser(null)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
    }

    return (
        <AuthContext.Provider value={{ token, user, setUser, setToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
