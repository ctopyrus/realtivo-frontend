"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Note {
    id: string;
    content: string;
    createdAt: string;
}

interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    createdAt: string;
}

interface Tag {
    id: string;
    name: string;
}

export default function LeadDetailsPage() {
    const { id } = useParams();
    const router = useRouter();

    // States for lead data, loading status, notes, tags, and new inputs
    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState("");
    const [tags, setTags] = useState<Tag[]>([]);
    const [newTag, setNewTag] = useState("");

    // Fetch lead details, notes, and tags on component mount or id change
    useEffect(() => {
        if (!id) return;

        setLoading(true);
        axios
            .get(`/api/leads/${id}`)
            .then((res) => {
                setLead(res.data);
                setLoading(false);
                fetchNotes();
                fetchTags();
            })
            .catch(() => {
                toast.error("Failed to load lead");
                router.push("/leads");
            });
    }, [id, router]);

    // Fetch notes related to this lead
    const fetchNotes = async () => {
        try {
            const res = await axios.get(`/api/leads/${id}/notes`);
            setNotes(res.data);
        } catch (err) {
            console.error("Failed to fetch notes", err);
            toast.error("Unable to load notes");
        }
    };

    // Fetch tags related to this lead
    const fetchTags = async () => {
        try {
            const res = await axios.get(`/api/leads/${id}/tags`);
            setTags(res.data);
        } catch (err) {
            console.error("Failed to fetch tags", err);
            toast.error("Unable to load tags");
        }
    };

    // Handle adding a new note
    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        try {
            await axios.post(`/api/leads/${id}/notes`, {
                content: newNote.trim(),
            });
            setNewNote("");
            toast.success("Note added");
            fetchNotes(); // Refresh notes
        } catch (err) {
            console.error("Failed to add note", err);
            toast.error("Failed to add note");
        }
    };

    // Handle adding a new tag
    const handleAddTag = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTag.trim()) return;

        try {
            await axios.post(`/api/leads/${id}/tags`, { name: newTag.trim() });
            setNewTag("");
            toast.success("Tag added");
            fetchTags(); // Refresh tags
        } catch {
            toast.error("Failed to add tag");
        }
    };

    // Loading or not found states
    if (loading) return <p className="p-4">Loading...</p>;
    if (!lead) return <p className="p-4 text-red-600">Lead not found.</p>;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">🧾 Lead Details</h1>
                <div className="space-x-2">
                    <Button variant="outline" onClick={() => router.back()}>
                        Back
                    </Button>
                    <Button onClick={() => router.push(`/leads/edit/${lead.id}`)}>Edit</Button>
                </div>
            </div>

            {/* Lead Information */}
            <Card>
                <CardContent className="p-4 space-y-4">
                    <div>
                        <strong>Name:</strong> {lead.name || "—"}
                    </div>
                    <div>
                        <strong>Email:</strong> {lead.email || "—"}
                    </div>
                    <div>
                        <strong>Phone:</strong> {lead.phone || "—"}
                    </div>
                    <div>
                        <strong>Status:</strong> {lead.status || "—"}
                    </div>
                    <div>
                        <strong>Created At:</strong> {new Date(lead.createdAt).toLocaleString()}
                    </div>
                </CardContent>
            </Card>

            {/* Notes Section */}
            <Card>
                <CardContent className="p-4 space-y-4">
                    <h2 className="text-lg font-semibold mb-2">📝 Notes</h2>
                    {notes.length === 0 ? (
                        <p className="text-sm text-gray-500">No notes yet.</p>
                    ) : (
                        <ul className="space-y-2 max-h-64 overflow-y-auto">
                            {notes.map((note) => (
                                <li key={note.id} className="border p-2 rounded text-sm">
                                    <p>{note.content}</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(note.createdAt).toLocaleString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}

                    <form onSubmit={handleAddNote} className="mt-4 space-y-2">
                        <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                            placeholder="Add a new note..."
                            rows={3}
                            aria-label="Add a new note"
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition"
                        >
                            Add Note
                        </button>
                    </form>
                </CardContent>
            </Card>

            {/* Tags Section */}
            <Card>
                <CardContent className="p-4 space-y-4">
                    <h2 className="text-lg font-semibold mb-2">🏷️ Tags</h2>

                    {tags.length === 0 ? (
                        <p className="text-sm text-gray-500">No tags yet.</p>
                    ) : (
                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                            {tags.map((tag) => (
                                <span
                                    key={tag.id}
                                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center"
                                >
                                    {tag.name}
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                await axios.delete(`/api/leads/${id}/tags/${tag.id}`);
                                                toast.success("Tag removed");
                                                fetchTags();
                                            } catch {
                                                toast.error("Failed to remove tag");
                                            }
                                        }}
                                        className="ml-1 text-red-500 hover:text-red-700 text-xs"
                                        aria-label={`Remove tag ${tag.name}`}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleAddTag} className="mt-4 flex items-center gap-2">
                        <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add new tag"
                            className="border rounded px-2 py-1 text-sm w-48"
                            aria-label="New tag name"
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition"
                        >
                            Add
                        </button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
