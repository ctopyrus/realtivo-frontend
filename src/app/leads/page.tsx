// realtivo-frontend/app/leads/page.tsx

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from "next/link"

export default function LeadsPage() {
    const router = useRouter()
    const [leads, setLeads] = useState<any[]>([])
    const [search, setSearch] = useState("")

    useEffect(() => {
        fetchLeads()
    }, [])

    const fetchLeads = () => {
        axios
            .get("/api/leads")
            .then((res) => {
                setLeads(res.data)
            })
            .catch((err) => {
                console.error("Failed to fetch leads:", err)
                if (err.response?.status === 401) {
                    router.push("/login")
                }
            })
    }

    const handleDelete = async (id: string) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this lead?")
        if (!confirmDelete) return

        try {
            await axios.delete(`/api/leads/${id}`)
            router.refresh()
            toast.success("Lead deleted successfully")
            // Remove from UI
            setLeads((prev) => prev.filter((lead) => lead.id !== id))
        } catch (error) {
            toast.error("Failed to delete lead")
            console.error(error)
            alert()
        }
    }

    const filteredLeads = leads.filter((lead) => {
        const q = search.toLowerCase()
        return (
            lead.name?.toLowerCase().includes(q) ||
            lead.email?.toLowerCase().includes(q) ||
            lead.phone?.toLowerCase().includes(q)
        )
    })

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">📋 All Leads</h1>
            <div className="my-4">
                <Link href="/leads/create">
                    <Button variant="default">➕ Create Lead</Button>
                </Link>
            </div>

            <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-md"
            />

            <Card>
                <CardContent className="p-4 overflow-x-auto">
                    <div className="min-w-[600px]">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-600 border-b">
                                    <th className="pb-2">Name</th>
                                    <th className="pb-2">Email</th>
                                    <th className="pb-2">Phone</th>
                                    <th className="pb-2">Status</th>
                                    <th className="pb-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="border-t">
                                        <td className="py-2">{lead.name || lead.fullName || "—"}</td>
                                        <td className="py-2">{lead.email || "—"}</td>
                                        <td className="py-2">{lead.phone || "—"}</td>
                                        <td className="py-2">{lead.status || "—"}</td>
                                        <td className="py-2 space-x-2">
                                            <a
                                                href={`/leads/${lead.id}/edit`}
                                                className="text-sm text-blue-600 hover:underline"
                                            >
                                                Edit
                                            </a>


                                            <Button variant="outline" size="sm" disabled>
                                                Edit
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(lead.id)}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
