// A single lead from the backend
export interface Lead {
    id: string
    name: string
    email: string
    phone: string
    content: string
    status: 'Hot' | 'Warm' | 'Cold' | 'Closed'
    followUpDate?: string
    createdAt: string
    updatedAt: string
}

// Used when creating a new lead (e.g. from a form)
export type CreateLeadDto = Omit<
    Lead,
    "id" | "createdAt" | "updatedAt"
> & {
    status?: 'Hot' | 'Warm' | 'Cold' | 'Closed'
}

// Data shape for React form usage
export type LeadFormData = {
    name: string
    email: string
    phone: string
    content: string
    status?: 'Hot' | 'Warm' | 'Cold' | 'Closed'
    followUpDate?: string
}

