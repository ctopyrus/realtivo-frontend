import axios from "axios"
import type { Lead } from "@/types/lead"

const API_URL = "http://localhost:3000"

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
