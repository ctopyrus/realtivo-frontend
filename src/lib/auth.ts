// lib/auth.ts

/**
 * Retrieves the stored JWT token from localStorage.
 * Useful for sending authenticated requests to the backend.
 */
export const getTokenFromLocalStorage = (): string | null => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("token")
    }
    return null
}
