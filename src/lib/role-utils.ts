import type { User } from "../types/user"

export function isAdmin(user?: User | null) {
    return user?.role === "admin"
}

export function isAgent(user?: User | null) {
    return user?.role === "agent"
}
