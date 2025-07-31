"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import axios from "axios"
import { getTokenFromLocalStorage } from "@/lib/auth"

export default function CreateLeadPage() {
    const router = useRouter()
    const [leadData, setLeadData] = useState({
        name: "",
        email: "",
        phone: "",
        status: "Cold",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setLeadData({ ...leadData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const token = getTokenFromLocalStorage()

            await axios.post("/api/leads", leadData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            router.push("/dashboard")
        } catch (err) {
            console.error("Error creating lead:", err)
            alert("Failed to create lead")
        }
    }

    return (
        <div className="max-w-xl mx-auto mt-10">
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">➕ Add New Lead</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            name="name"
                            placeholder="Name"
                            value={leadData.name}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            name="email"
                            type="email"
                            placeholder="Email"
                            value={leadData.email}
                            onChange={handleChange}
                        />
                        <Input
                            name="phone"
                            placeholder="Phone"
                            value={leadData.phone}
                            onChange={handleChange}
                        />
                        <select
                            name="status"
                            value={leadData.status}
                            onChange={handleChange}
                            className="border rounded px-3 py-2 w-full"
                        >
                            <option value="Cold">Cold</option>
                            <option value="Warm">Warm</option>
                            <option value="Hot">Hot</option>
                            <option value="Closed">Closed</option>
                        </select>

                        <Button type="submit" className="w-full">
                            Create Lead
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
