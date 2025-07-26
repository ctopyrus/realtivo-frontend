import { useEffect, useState } from "react"
import type { Lead } from "@/types/lead"
import { fetchLeads, deleteLead, createLead, updateLead } from "@/lib/api/leads"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { LeadForm } from "./lead-form"
import type { CreateLeadDto } from "@/types/lead"

export default function LeadsTable() {
    const { token } = useAuth()
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
    const [showDialog, setShowDialog] = useState(false)

    // 🔄 Load all leads from API
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

    // ➕ Open "Add Lead" Modal
    const openAddDialog = () => {
        setSelectedLead(null)
        setShowDialog(true)
    }

    // ✏️ Open "Edit Lead" Modal
    const openEditDialog = (lead: Lead) => {
        setSelectedLead(lead)
        setShowDialog(true)
    }

    // ❌ Close Modal
    const closeDialog = () => {
        setSelectedLead(null)
        setShowDialog(false)
    }

    // ✅ Create or Update Lead
    const handleFormSubmit = async (formData: CreateLeadDto) => {
        try {
            if (selectedLead) {
                await updateLead(token!, selectedLead.id, formData)
                toast.success("Lead updated successfully")
            } else {
                await createLead(token!, formData)
                toast.success("Lead added successfully")
            }
            await loadLeads()
            closeDialog()
        } catch (error) {
            toast.error("Failed to save lead")
            console.error("Failed to submit lead", error)
        }
    }

    // 🗑️ Delete Lead
    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this lead?")) {
            try {
                await deleteLead(token!, id)
                setLeads((prev) => prev.filter((lead) => lead.id !== id))
                toast.success("Lead deleted successfully")
            } catch (error) {
                toast.error("Failed to delete lead")
                console.error("Failed to delete lead", error)
            }
        }
    }

    useEffect(() => {
        loadLeads()
    }, [])

    if (loading) return <p>Loading leads...</p>

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Leads</h2>
                <Button onClick={openAddDialog}>Add Lead</Button>
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedLead ? "Edit Lead" : "Add Lead"}</DialogTitle>
                    </DialogHeader>
                    <LeadForm
                        defaultValues={selectedLead || undefined}
                        onSubmit={handleFormSubmit}
                        onCancel={closeDialog}
                    />
                </DialogContent>
            </Dialog>

            {leads.length === 0 ? (
                <p>No leads found.</p>
            ) : (
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
                                    <td className="px-4 py-2 space-x-2">
                                        <Button size="sm" onClick={() => openEditDialog(lead)}>
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
            )}
        </div>
    )
}
