"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { leadSchema } from "@/lib/validators";
import { z } from "zod";

interface LeadForm {
    name: string;
    email: string;
    phone: string;
    status: string;
}

export default function CreateLeadPage() {
    const router = useRouter();

    const [form, setForm] = useState<LeadForm>({
        name: "",
        email: "",
        phone: "",
        status: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Simple Validation
        if (!form.name.trim() || !form.email.trim() || !form.status.trim()) {
            toast.error("Name, Email, and Status are required");
            return;
        }

        try {
            leadSchema.parse(form);
        } catch (err) {
            if (err instanceof z.ZodError && err.issues.length > 0) {
                toast.error(err.issues[0].message);
                return;
            }
            toast.error("Validation failed");
            return;
        }


        try {
            await axios.post("/api/leads", form);
            toast.success("Lead created successfully");
            router.push("/leads");
        } catch (error) {
            console.error(error);
            toast.error("Failed to create lead");
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">➕ Create New Lead</h1>

            <Card>
                <CardContent className="p-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block mb-1 text-sm">
                                Name *
                            </label>
                            <input
                                id="name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                placeholder="Full name"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block mb-1 text-sm">
                                Email *
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                placeholder="Email address"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block mb-1 text-sm">
                                Phone
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                placeholder="Phone number"
                            />
                        </div>

                        <div>
                            <label htmlFor="status" className="block mb-1 text-sm">
                                Status *
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            >
                                <option value="">Select status</option>
                                <option value="Hot">Hot</option>
                                <option value="Warm">Warm</option>
                                <option value="Cold">Cold</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>

                        <Button type="submit" className="w-full">
                            Create Lead
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
