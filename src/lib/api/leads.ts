import axios from "axios"
import type { Lead } from "@/types/lead"
import type { CreateLeadDto } from "@/types/lead"

const API_URL = "http://localhost:3000"

export async function createLead(token: string, data: CreateLeadDto) {
    const res = await axios.post(`${API_URL}/leads`, data, {
        headers: { Authorization: `Bearer ${token}` },
    })
    return res.data
}

export async function updateLead(token: string, id: string, data: CreateLeadDto) {
    const res = await axios.put(`${API_URL}/leads/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    })
    return res.data
}

export async function fetchLeads(token: string): Promise<Lead[]> {
    const res = await axios.get(`${API_URL}/leads`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    return res.data
}

export async function deleteLead(token: string, id: string) {
    await axios.delete(`${API_URL}/leads/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
}

export async function fetchAllTags() {
    const res = await fetch("/api/tags")
    if (!res.ok) throw new Error("Failed to fetch tags")
    return res.json()
}

export async function removeTagFromLead(leadId: string, tagId: string) {
    const res = await fetch(`/api/leads/${leadId}/tags/${tagId}`, {
        method: "DELETE"
    })
    if (!res.ok) throw new Error("Failed to remove tag")
}
