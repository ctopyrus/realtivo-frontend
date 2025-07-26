export interface User {
    id: string
    email: string
    role: "admin" | "agent"
    createdAt?: string
    updatedAt?: string
}
