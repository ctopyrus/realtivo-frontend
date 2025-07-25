import { createContext, useContext, useEffect, useState } from "react"

interface AuthContextType {
    user: string | null
    token: string | null
    login: (token: string) => void
    logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null)
    const [user, setUser] = useState<string | null>(null)

    useEffect(() => {
        const savedToken = localStorage.getItem("token")
        const savedUser = localStorage.getItem("user")
        if (savedToken) {
            setToken(savedToken)
        }
        if (savedUser) {
            setUser(savedUser)
        }
    }, [])

    const login = (newToken: string) => {
        setToken(newToken)
        setUser("logged-in")
        localStorage.setItem("token", newToken)
        localStorage.setItem("user", "logged-in")
    }

    const logout = () => {
        setToken(null)
        setUser(null)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
    }

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
