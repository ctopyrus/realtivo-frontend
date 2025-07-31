// realtivo-frontend/app/leads/[id]/edit/page.tsx

"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

export default function EditLeadPage() {
    const router = useRouter()
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [lead, setLead] = useState({
        name: "",
        email: "",
        phone: "",
        status: "Cold",
    })

    useEffect(() => {
        axios
            .get(`/api/leads/${id}`)
            .then((res) => {
                setLead(res.data)
                setLoading(false)
            })
            .catch((err) => {
                console.error("Error Loading lead:", err)
                toast.error("Failed to load lead")
                router.push("/leads")
            })
    }, [id, router])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setLead({ ...lead, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await axios.put(`/api/leads/${id}`, lead)
            toast.success("Lead updated successfully")
            router.push("/leads")
        } catch (error) {
            toast.error("Failed to update lead")
        }
    }

    if (loading) return <p className="p-4">Loading...</p>

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">✏️ Edit Lead</h1>

            <Card>
                <CardContent className="p-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Name</Label>
                            <Input name="name" value={lead.name} onChange={handleChange} required />
                        </div>
                        <div>
                            <Label>Email</Label>
                            <Input type="email" name="email" value={lead.email} onChange={handleChange} required />
                        </div>
                        <div>
                            <Label>Phone</Label>
                            <Input name="phone" value={lead.phone} onChange={handleChange} />
                        </div>
                        <div>
                            <Label>Status</Label>
                            <select
                                name="status"
                                value={lead.status}
                                onChange={handleChange}
                                className="w-full border rounded px-2 py-1"
                            >
                                <option value="Cold">Cold</option>
                                <option value="Warm">Warm</option>
                                <option value="Hot">Hot</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                        <div className="flex justify-between">
                            <Button type="submit">Update Lead</Button>
                            <Button variant="outline" type="button" onClick={() => router.back()}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
