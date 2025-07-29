"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import LoginForm from "@/components/LoginForm"
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
    CartesianGrid,
} from "recharts"
import axios from "axios"
import { useRouter } from "next/navigation"


const STATUS_COLORS: Record<string, string> = {
    Hot: "#ef4444",
    Warm: "#f59e0b",
    Cold: "#3b82f6",
    Closed: "#10b981",
}


// Rename the first LoginPage to something else, e.g., LoginPageWithForm or LoginFormWrapper
export function LoginFormWrapper() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 space-y-6">
                <h1 className="text-2xl font-bold text-center">🔐 Login to Realtivo</h1>
                <LoginForm />
            </div>
        </div>
    )
}

// Rename the second LoginPage to just LoginPage (default export)
export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        try {
            const res = await axios.post("http://localhost:5000/api/auth/login", {
                email,
                password,
            })

            const { token } = res.data
            localStorage.setItem("realtivo_token", token)

            router.push("/dashboard")
        } catch (err: any) {
            if (err.response?.data?.message) {
                setError(err.response.data.message)
            } else {
                setError("Login failed. Please try again.")
            }
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">🔐 Login to Realtivo</h2>

                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition"
                >
                    Login
                </button>
            </form>
        </div>
    )
}


// DashboardPage should be in its own file or exported named here, not default again.
// So rename this to a named export, and export it (remove default)
export function DashboardPage() {
    const [search, setSearch] = useState("")
    const [leads, setLeads] = useState<any[]>([])
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const tagOptions = ["Buyer", "Seller", "Investor", "Agent"]
    const [statusFilter, setStatusFilter] = useState<string>("")
    const [visibleCount, setVisibleCount] = useState(10)

    // Fetch leads on mount
    useEffect(() => {
        axios
            .get("/api/leads")
            .then((res) => setLeads(res.data))
            .catch((err) => {
                console.error("Error fetching leads:", err)
            })
    }, [])

    // Reset filters
    const resetFilters = useCallback(() => {
        setSearch("")
        setSelectedTags([])
        setStatusFilter("")
    }, [])

    // Aggregate leads by status for Pie chart
    const leadsByStatus = Object.entries(
        leads.reduce((acc: Record<string, number>, lead) => {
            acc[lead.status] = (acc[lead.status] || 0) + 1
            return acc
        }, {})
    ).map(([status, count]) => ({ name: status, value: count }))

    // Aggregate leads by date for Line chart
    const leadsByDate = Object.entries(
        leads.reduce((acc: Record<string, number>, lead) => {
            const date = new Date(lead.createdAt).toLocaleDateString()
            acc[date] = (acc[date] || 0) + 1
            return acc
        }, {})
    )
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Filter leads
    const filteredLeads = leads
        .filter((lead) => {
            const q = search.toLowerCase()
            const matchesSearch =
                lead.name?.toLowerCase().includes(q) ||
                lead.email?.toLowerCase().includes(q) ||
                lead.phone?.toLowerCase().includes(q)

            const matchesTags =
                selectedTags.length === 0 || selectedTags.some((tag) => lead.tags?.includes(tag))

            const matchesStatus = statusFilter === "" || lead.status === statusFilter

            return matchesSearch && matchesTags && matchesStatus
        })
        .reverse()

    const totalLeads = leads.length

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">📊 Lead Analytics Dashboard</h1>

            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search by name, email, or phone"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="p-2 border rounded w-full md:w-64"
                />
                <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-gray-100 text-sm rounded hover:bg-gray-200 transition w-full md:w-auto"
                >
                    Reset Filters
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                {/* Tag filters */}
                <div className="mb-4 md:mb-0 md:w-1/2">
                    <p className="text-sm font-medium mb-2">Filter by Tags</p>
                    <div className="flex flex-wrap gap-2">
                        {tagOptions.map((tag) => (
                            <label
                                key={tag}
                                className="flex items-center gap-1 text-sm border px-2 py-1 rounded cursor-pointer select-none"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedTags.includes(tag)}
                                    onChange={() => {
                                        setSelectedTags((prev) =>
                                            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                                        )
                                    }}
                                    className="cursor-pointer"
                                />
                                {tag}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Status filter */}
                <div className="md:w-1/2 flex flex-col">
                    <p className="text-sm font-medium mb-2">Filter by Status</p>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="p-2 border rounded-md max-w-xs"
                    >
                        <option value="">All Statuses</option>
                        <option value="Hot">Hot</option>
                        <option value="Warm">Warm</option>
                        <option value="Cold">Cold</option>
                        <option value="Closed">Closed</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Total Leads Card */}
                <Card>
                    <CardContent className="px-6 py-4 h-64 flex flex-col justify-center items-center">
                        <p className="text-gray-500 text-sm">Total Leads</p>
                        <h2 className="text-4xl font-bold">{totalLeads}</h2>
                    </CardContent>
                </Card>

                {/* Leads by Status Chart */}
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
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={STATUS_COLORS[entry.name] || "#8884d8"}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Leads Over Time Chart */}
            <Card>
                <CardContent className="p-4 h-80">
                    <p className="text-gray-500 text-sm mb-2">Leads Over Time</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={leadsByDate}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#6366f1"
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Leads Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-200">
                    <thead>
                        <tr className="text-left text-gray-600 border-b border-gray-300">
                            <th className="py-2 px-3">Name</th>
                            <th className="py-2 px-3">Email</th>
                            <th className="py-2 px-3">Phone</th>
                            <th className="py-2 px-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLeads.slice(0, visibleCount).map((lead) => (
                            <tr
                                key={lead.id}
                                className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                <td className="py-2 px-3">{lead.name || lead.fullName || "—"}</td>
                                <td className="py-2 px-3">{lead.email || "—"}</td>
                                <td className="py-2 px-3">{lead.phone || "—"}</td>
                                <td className="py-2 px-3">{lead.status || "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Load More Button */}
            {visibleCount < filteredLeads.length && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => setVisibleCount((prev) => prev + 10)}
                        className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    )
}
