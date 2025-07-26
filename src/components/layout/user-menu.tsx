"use client"

import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/context/AuthContext"

import { LogOut } from "lucide-react"
import { toast } from "sonner"

export function UserMenu() {
    const { user, logout } = useAuth()
    const router = useRouter()

    const handleLogout = () => {
        logout() // clears auth from localStorage + context
        toast.success("Logged out")
        router.push("/login")
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer w-8 h-8">
                    <AvatarFallback>
                        {user?.email?.charAt(0).toUpperCase() ?? "?"}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                    <div className="text-sm font-medium">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
