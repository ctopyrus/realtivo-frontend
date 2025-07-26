export interface Lead {
    id: string
    name: string
    email: string
    phone: string
    status: string
    createdAt: string
    updatedAt: string
}

export type CreateLeadDto = Omit<Lead, "id" | "status" | "createdAt" | "updatedAt"> & {
    status?: string
}