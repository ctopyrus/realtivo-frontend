"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface User {
    id: string;
    name: string;
    email: string;
    // Add other user fields here if needed
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (token: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
    login: () => { },
    logout: () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Initialize auth state from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem("realtivo_token");
        if (storedToken) {
            try {
                const decoded = jwtDecode<User>(storedToken);
                setUser(decoded);
                setToken(storedToken);
            } catch (err) {
                console.error("Invalid token in localStorage:", err);
                localStorage.removeItem("realtivo_token");
                setUser(null);
                setToken(null);
            }
        }
        setLoading(false);
    }, []);

    // Login function saves token and decodes user info
    const login = (newToken: string) => {
        try {
            const decoded = jwtDecode<User>(newToken);
            setUser(decoded);
            setToken(newToken);
            localStorage.setItem("realtivo_token", newToken);
        } catch (err) {
            console.error("Invalid token on login:", err);
            logout();
        }
    };

    // Logout function clears storage and state, then redirects
    const logout = () => {
        localStorage.removeItem("realtivo_token");
        setUser(null);
        setToken(null);
        navigate("/login");
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, user, token, loading, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
