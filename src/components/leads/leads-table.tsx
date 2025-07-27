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
import { isAdmin, isAgent } from "@/lib/role-utils"
import { LeadSearch } from "./lead-search"


export default function LeadsTable() {
    const { token } = useAuth()
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
    const [showDialog, setShowDialog] = useState(false)
    const { user } = useAuth()
    const [searchTerm, setSearchTerm] = useState("")
    const [filteredLeads, setFilteredLeads] = useState<Lead[]>(leads || [])
    const [currentPage, setCurrentPage] = useState(1)
    const leadsPerPage = 10

    {
        isAgent(user) && (
            <div className="text-sm text-muted-foreground mb-2">
                🔒 Read-only mode — you can only view leads.
            </div>
        )
    }

    <LeadSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

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

    {
        isAdmin(user) && (
            <Button onClick={openAddDialog}>Add Lead</Button>
        )
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

    const indexOfLastLead = currentPage * leadsPerPage
    const indexOfFirstLead = indexOfLastLead - leadsPerPage
    const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead)
    const totalPages = Math.ceil(filteredLeads.length / leadsPerPage)


    useEffect(() => {
        const term = searchTerm.toLowerCase()
        const filtered = leads.filter(
            (lead) =>
                lead.name.toLowerCase().includes(term) ||
                lead.email.toLowerCase().includes(term)
        )
        setFilteredLeads(filtered)
        setCurrentPage(1)
    }, [searchTerm, leads])

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
                            {currentLeads.map((lead) => (
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
                                        <div className="flex items-center justify-between mt-4">
                                            <button
                                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                                            >
                                                Previous
                                            </button>

                                            <span className="text-sm text-gray-600">
                                                Page {currentPage} of {totalPages}
                                            </span>

                                            <button
                                                onClick={() =>
                                                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                                                }
                                                disabled={currentPage === totalPages}
                                                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                        </div>

                                        {isAdmin(user) && (
                                            <div className="flex gap-2">
                                                <Button onClick={() => openEditDialog(lead)}>Edit</Button>
                                                <Button variant="destructive" onClick={() => handleDelete(lead.id)}>Delete</Button>
                                            </div>
                                        )}

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
