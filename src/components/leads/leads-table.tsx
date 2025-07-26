import { useEffect, useState } from "react"
import type { Lead } from "@/types/lead"
import { fetchLeads, deleteLead } from "@/lib/api/leads"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"

export default function LeadsTable() {
    const { token } = useAuth()
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)

    const loadLeads = async () => {
        setLoading(true)
        try {
            const data = await fetchLeads(token!)
            setLeads(data)
        } catch (error) {
            console.error("Failed to load leads", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this lead?")) {
            try {
                await deleteLead(token!, id)
                setLeads((prev) => prev.filter((lead) => lead.id !== id))
            } catch (error) {
                console.error("Failed to delete lead", error)
            }
        }
    }

    useEffect(() => {
        loadLeads()
    }, [])

    if (loading) return <p>Loading leads...</p>

    if (leads.length === 0) return <p>No leads found.</p>

    return (
        <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Phone</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {leads.map((lead) => (
                        <tr key={lead.id}>
                            <td className="px-4 py-2">{lead.name}</td>
                            <td className="px-4 py-2">{lead.email}</td>
                            <td className="px-4 py-2">{lead.phone}</td>
                            <td className="px-4 py-2">{lead.status}</td>
                            <td className="px-4 py-2">
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(lead.id)}>
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
