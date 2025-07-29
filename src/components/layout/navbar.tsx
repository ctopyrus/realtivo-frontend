"use client"

import { useAuth } from "@/context/AuthContext"
import { usePathname } from "next/navigation"
import Link from "next/link"

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuth()
    const pathname = usePathname()

    // Don't show navbar on login or register page
    if (pathname === "/login" || pathname === "/register") return null

    return (
        <nav className="bg-white shadow-sm py-3 px-4 flex justify-between items-center mb-6">
            <Link href="/dashboard" className="text-xl font-bold text-primary">
                🏠 Realtivo
            </Link>

            {isAuthenticated && (
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                        {user?.name || user?.email}
                    </span>
                    <button
                        onClick={logout}
                        className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                        Logout
                    </button>
                </div>
            )}
        </nav>
    )
}
