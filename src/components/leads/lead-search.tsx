"use client"

import { Input } from "@/components/ui/input"

interface LeadSearchProps {
    searchTerm: string
    setSearchTerm: (term: string) => void
}

export function LeadSearch({ searchTerm, setSearchTerm }: LeadSearchProps) {
    return (
        <div className="mb-4">
            <Input
                type="text"
                placeholder="Search leads by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-sm"
            />
        </div>
    )
}
