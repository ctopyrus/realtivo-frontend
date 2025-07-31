"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";

export default function LeadsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Parse values from URL query parameters
    const page = Number(searchParams.get("page") || "1");
    const statusFromUrl = searchParams.get("status") || "";
    const searchFromUrl = searchParams.get("search") || "";

    // State to manage leads and search input
    const [leads, setLeads] = useState<any[]>([]);
    const [search, setSearch] = useState(searchFromUrl);
    const [status, setStatus] = useState(statusFromUrl);

    // Fetch leads from API with filters from state
    const fetchLeads = async () => {
        try {
            const query = new URLSearchParams();
            if (status) query.set("status", status);
            if (search) query.set("search", search);
            query.set("page", page.toString());
            query.set("limit", "10");

            const res = await axios.get(`/api/leads?${query.toString()}`);
            setLeads(res.data);
        } catch (err) {
            toast.error("Failed to load leads");
            console.error(err);
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                router.push("/login");
            }
        }
    };

    // Run fetch whenever filters or pagination changes
    useEffect(() => {
        fetchLeads();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, page, search]);

    // Handler for status change — updates URL params (resets page to 1)
    const handleStatusChange = (newStatus: string) => {
        const query = new URLSearchParams(searchParams.toString());
        if (newStatus) {
            query.set("status", newStatus);
        } else {
            query.delete("status");
        }
        if (search) query.set("search", search);
        query.set("page", "1");
        router.push(`/leads?${query.toString()}`);
        setStatus(newStatus);
    };

    // Handler for search input change — updates local state
    // Update URL immediately on input change for consistency, with debounce if needed (omitted here)
    const handleSearchChange = (value: string) => {
        setSearch(value);
        const query = new URLSearchParams(searchParams.toString());
        if (value) {
            query.set("search", value);
        } else {
            query.delete("search");
        }
        query.set("page", "1");
        if (status) query.set("status", status);
        router.push(`/leads?${query.toString()}`);
    };

    // Handler for deleting a lead
    const handleDelete = async (id: string) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this lead?");
        if (!confirmDelete) return;

        try {
            await axios.delete(`/api/leads/${id}`);
            toast.success("Lead deleted successfully");
            // Refresh data / UI
            fetchLeads();
        } catch (error) {
            toast.error("Failed to delete lead");
            console.error(error);
            alert("Failed to delete lead");
        }
    };

    // Filtered leads are already filtered server-side; 
    // If you want client-side filtering, you can do it here, but likely unnecessary
    // Showing all leads fetched from server here:
    const displayedLeads = leads;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">📋 All Leads</h1>

            <div className="my-4">
                <Link href="/leads/create">
                    <Button variant="default">➕ Create Lead</Button>
                </Link>
            </div>

            <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full max-w-md"
            />

            <Card>
                <CardContent className="p-4 overflow-x-auto">
                    <div className="min-w-[600px]">
                        {/* Status Filter */}
                        <select
                            value={status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="mb-4 p-2 border rounded text-sm"
                        >
                            <option value="">All Statuses</option>
                            <option value="Hot">Hot</option>
                            <option value="Warm">Warm</option>
                            <option value="Cold">Cold</option>
                            <option value="Closed">Closed</option>
                        </select>

                        {/* Leads Table */}
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-600 border-b">
                                    <th className="pb-2">Name</th>
                                    <th className="pb-2">Email</th>
                                    <th className="pb-2">Phone</th>
                                    <th className="pb-2">Status</th>
                                    <th className="pb-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedLeads.map((lead) => (
                                    <tr key={lead.id} className="border-t">
                                        <td className="py-2">{lead.name || lead.fullName || "—"}</td>
                                        <td className="py-2">{lead.email || "—"}</td>
                                        <td className="py-2">{lead.phone || "—"}</td>
                                        <td className="py-2">{lead.status || "—"}</td>
                                        <td className="py-2 space-x-2">
                                            <Link
                                                href={`/leads/${lead.id}/edit`}
                                                className="text-sm text-blue-600 hover:underline"
                                            >
                                                Edit
                                            </Link>
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
                                {displayedLeads.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-4 text-center text-gray-500">
                                            No leads found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4 max-w-md mx-auto">
                <Button
                    variant="link"
                    disabled={page <= 1}
                    onClick={() => {
                        const query = new URLSearchParams(searchParams.toString());
                        query.set("page", String(page - 1));
                        router.push(`/leads?${query.toString()}`);
                    }}
                    className="text-sm disabled:opacity-50"
                >
                    ← Previous
                </Button>

                <span className="text-sm">Page {page}</span>

                <Button
                    variant="link"
                    onClick={() => {
                        const query = new URLSearchParams(searchParams.toString());
                        query.set("page", String(page + 1));
                        router.push(`/leads?${query.toString()}`);
                    }}
                    className="text-sm"
                >
                    Next →
                </Button>
            </div>
        </div>
    );
}
