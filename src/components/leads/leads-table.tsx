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
    const [statusFilter, setStatusFilter] = useState<string | null>(null)
    const { token, user } = useAuth()
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
    const [showDialog, setShowDialog] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const leadsPerPage = 10

    // Load leads from API
    const loadLeads = async () => {
        setLoading(true)
        try {
            if (!token) throw new Error("No auth token")
            const data = await fetchLeads(token)
            setLeads(data)
        } catch (error) {
            console.error("Failed to load leads", error)
        } finally {
            setLoading(false)
        }
    }

    // Load leads on mount
    useEffect(() => {
        loadLeads()
    }, [])

    // Apply search and status filtering
    useEffect(() => {
        let filtered = leads

        // Filter by status if selected
        if (statusFilter) {
            filtered = filtered.filter((lead) => lead.status === statusFilter)
        }

        // Filter by search term
        const term = searchTerm.trim().toLowerCase()
        if (term) {
            filtered = filtered.filter(
                (lead) =>
                    lead.name.toLowerCase().includes(term) ||
                    lead.email.toLowerCase().includes(term)
            )
        }

        setFilteredLeads(filtered)
        setCurrentPage(1)
    }, [statusFilter, searchTerm, leads])

    // Pagination values
    const totalPages = Math.ceil(filteredLeads.length / leadsPerPage) || 1
    const indexOfLastLead = currentPage * leadsPerPage
    const indexOfFirstLead = indexOfLastLead - leadsPerPage
    const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead)

    // Open add lead modal
    const openAddDialog = () => {
        setSelectedLead(null)
        setShowDialog(true)
    }

    // Open edit lead modal
    const openEditDialog = (lead: Lead) => {
        setSelectedLead(lead)
        setShowDialog(true)
    }

    // Close modal
    const closeDialog = () => {
        setSelectedLead(null)
        setShowDialog(false)
    }

    // Handle form submit - create or update lead
    const handleFormSubmit = async (formData: CreateLeadDto) => {
        try {
            if (!token) throw new Error("No auth token")
            if (selectedLead) {
                await updateLead(token, selectedLead.id, formData)
                toast.success("Lead updated successfully")
            } else {
                await createLead(token, formData)
                toast.success("Lead added successfully")
            }
            await loadLeads()
            closeDialog()
        } catch (error) {
            toast.error("Failed to save lead")
            console.error("Failed to submit lead", error)
        }
    }

    // Delete a lead
    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this lead?")) {
            try {
                if (!token) throw new Error("No auth token")
                await deleteLead(token, id)
                setLeads((prev) => prev.filter((lead) => lead.id !== id))
                toast.success("Lead deleted successfully")
            } catch (error) {
                toast.error("Failed to delete lead")
                console.error("Failed to delete lead", error)
            }
        }
    }

    if (loading) return <p>Loading leads...</p>

    return (
        <div className="p-4">
            {/* Agent read-only notice */}
            {isAgent(user) && (
                <div className="text-sm text-muted-foreground mb-2">
                    🔒 Read-only mode — you can only view leads.
                </div>
            )}

            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Leads</h2>
                {isAdmin(user) && (
                    <Button onClick={openAddDialog}>Add Lead</Button>
                )}
            </div>

            {/* Search */}
            <LeadSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

            {/* Status filter buttons */}
            <div className="flex gap-2 mb-4">
                {["All", "Hot", "Warm", "Cold", "Closed"].map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status === "All" ? null : status)}
                        className={`px-3 py-1 rounded-full text-sm font-medium border transition
                            ${statusFilter === status ||
                                (status === "All" && statusFilter === null)
                                ? "bg-black text-white"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }
                        `}
                    >
                        {status === "Hot" && "🔥 "}
                        {status === "Warm" && "🌤️ "}
                        {status === "Cold" && "❄️ "}
                        {status === "Closed" && "✅ "}
                        {status}
                    </button>
                ))}
            </div>

            {/* Leads table or no leads message */}
            {filteredLeads.length === 0 ? (
                <p>No leads found.</p>
            ) : (
                <>
                    <div className="overflow-x-auto border rounded-lg mt-2">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left">Name</th>
                                    <th className="px-4 py-2 text-left">Email</th>
                                    <th className="px-4 py-2 text-left">Phone</th>
                                    <th className="px-4 py-2 text-left">Status</th>
                                    {isAdmin(user) && (
                                        <th className="px-4 py-2 text-left">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentLeads.map((lead) => (
                                    <tr key={lead.id}>
                                        <td className="px-4 py-2">{lead.name}</td>
                                        <td className="px-4 py-2">{lead.email}</td>
                                        <td className="px-4 py-2">{lead.phone}</td>
                                        <td className="px-4 py-2">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full font-semibold ${lead.status === "Hot"
                                                        ? "bg-red-100 text-red-800"
                                                        : lead.status === "Warm"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : lead.status === "Cold"
                                                                ? "bg-blue-100 text-blue-800"
                                                                : lead.status === "Closed"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : ""
                                                    }`}
                                            >
                                                {lead.status}
                                            </span>
                                        </td>
                                        {isAdmin(user) && (
                                            <td className="px-4 py-2 space-x-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => openEditDialog(lead)}
                                                >
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
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
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
                                setCurrentPage((prev) =>
                                    Math.min(prev + 1, totalPages)
                                )
                            }
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}

            {/* Modal Dialog for Add/Edit */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {selectedLead ? "Edit Lead" : "Add Lead"}
                        </DialogTitle>
                    </DialogHeader>
                    <LeadForm
                        defaultValues={selectedLead || undefined}
                        onSubmit={handleFormSubmit}
                        onCancel={closeDialog}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}
