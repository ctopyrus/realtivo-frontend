'use client'

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
import axios from "axios"

const STATUS_COLORS: Record<string, string> = {
    Hot: "#ef4444",     // red
    Warm: "#f59e0b",    // yellow
    Cold: "#3b82f6",    // blue
    Closed: "#10b981",  // green
}

export default function DashboardPage() {
    const [leads, setLeads] = useState<any[]>([])

    useEffect(() => {
        axios.get("/api/leads").then((res) => {
            setLeads(res.data)
        })
    }, [])

    const totalLeads = leads.length

    const leadsByStatus = Object.entries(
        leads.reduce((acc: any, lead) => {
            acc[lead.status] = (acc[lead.status] || 0) + 1
            return acc
        }, {})
    ).map(([status, count]) => ({ name: status, value: count }))

    const leadsByDate = Object.entries(
        leads.reduce((acc: any, lead) => {
            const date = new Date(lead.createdAt).toLocaleDateString()
            acc[date] = (acc[date] || 0) + 1
            return acc
        }, {})
    ).map(([date, count]) => ({ date, count }))

    const recentLeads = leads.slice(-5).reverse()

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">📊 Lead Analytics Dashboard</h1>

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
                                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />
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
                            {recentLeads.map((lead) => (
                                <tr key={lead.id} className="border-t">
                                    <td className="py-2">{lead.fullName}</td>
                                    <td className="py-2">{lead.email}</td>
                                    <td className="py-2">{lead.phone}</td>
                                    <td className="py-2">{lead.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    )
}
