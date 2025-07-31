"use client"

import { useEffect, useState, type Key } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import axios from "axios"
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts"
import AuthGuard from "@/components/auth/AuthGuard"


const STATUS_COLORS: Record<string, string> = {
    Hot: "#ef4444",
    Warm: "#f59e0b",
    Cold: "#3b82f6",
    Closed: "#10b981"
}

export default function ProtectedDashboardPage() {
    const [leads, setLeads] = useState<any[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    // 🧼 Clear token and redirect to login
    const handleLogout = () => {
        localStorage.removeItem("realtivo_token")
        router.push("/login")
    }

    useEffect(() => {
        const token = localStorage.getItem("realtivo_token")

        if (!token) {
            router.push("/login")
            return
        }

        axios
            .get("http://localhost:5000/api/leads", {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then((res) => {
                setLeads(res.data)
                setLoading(false)
            })
            .catch((err) => {
                console.error("Auth error or token expired:", err)
                handleLogout()
            })
    }, [router])

    const totalLeads = leads.length

    const leadsByStatus = Object.entries(
        leads.reduce((acc: Record<string, number>, lead) => {
            acc[lead.status] = (acc[lead.status] || 0) + 1
            return acc
        }, {})
    ).map(([status, count]) => ({ name: status, value: count }))

    const leadsByDate = Object.entries(
        leads.reduce((acc: Record<string, number>, lead) => {
            const date = new Date(lead.createdAt).toLocaleDateString()
            acc[date] = (acc[date] || 0) + 1
            return acc
        }, {})
    ).map(([date, count]) => ({ date, count }))

    const filteredLeads = leads.filter((lead) => {
        const q = search.toLowerCase()
        return (
            lead.name?.toLowerCase().includes(q) ||
            lead.email?.toLowerCase().includes(q) ||
            lead.phone?.toLowerCase().includes(q)
        )
    })

    const recentLeads = leads.slice(-5).reverse() //updated recent leads

    if (loading) {
        return <p className="text-center py-10">Loading dashboard...</p>
    }

    return (
        <AuthGuard>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">📊 Lead Analytics Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    >
                        Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-gray-500 text-sm">Total Leads</p>
                            <h2 className="text-4xl font-bold">{totalLeads}</h2>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 h-64">
                            <p className="text-gray-500 text-sm mb-2">Leads by Status</p>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={leadsByStatus}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label
                                    >
                                        {leadsByStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || "#8884d8"} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="p-4 h-80">
                        <p className="text-gray-500 text-sm mb-2">Leads Over Time</p>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={leadsByDate}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <input
                    type="text"
                    placeholder="Search by name, email, or phone"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="p-2 border rounded w-full max-w-md mb-4"
                />

                <Card>
                    <CardContent className="p-4">
                        <p className="text-gray-500 text-sm mb-2">Recent Leads</p>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-600">
                                    <th className="pb-2">Name</th>
                                    <th className="pb-2">Email</th>
                                    <th className="pb-2">Phone</th>
                                    <th className="pb-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(search ? filteredLeads : recentLeads).map((lead: { id: Key | null | undefined; name: any; fullName: any; email: any; phone: any; status: any }) => (
                                    <tr key={lead.id} className="border-t">
                                        <td className="py-2">{lead.name || lead.fullName || "—"}</td>
                                        <td className="py-2">{lead.email || "—"}</td>
                                        <td className="py-2">{lead.phone || "—"}</td>
                                        <td className="py-2">{lead.status || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </AuthGuard>
    )
}
