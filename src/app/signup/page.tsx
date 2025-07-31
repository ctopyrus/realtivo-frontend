"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signupSchema } from "@/lib/validators";
import { ZodError } from "zod";

export default function SignupPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            signupSchema.parse(form);
        } catch (err) {
            if (err instanceof ZodError && err.issues.length > 0) {
                toast.error(err.issues[0].message);
                return;
            }
            toast.error("Validation failed");
            return;
        }

        // ✅ Basic Validation (Optional, but good to keep for immediate user feedback)
        if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
            toast.error("All fields are required");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            toast.error("Invalid email format");
            return;
        }

        if (form.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Signup failed");

            toast.success("Signup successful");
            router.push("/login");
        } catch (err: any) {
            toast.error(err.message || "Failed to sign up");
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 space-y-6">
            <h1 className="text-2xl font-bold">🔐 Create an Account</h1>

            <Card>
                <CardContent className="p-4">
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div>
                            <label htmlFor="name" className="block mb-1 text-sm">
                                Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                placeholder="Full Name"
                                required
                                autoComplete="name"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block mb-1 text-sm">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                placeholder="Email Address"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block mb-1 text-sm">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                placeholder="Password"
                                required
                                minLength={6}
                                autoComplete="new-password"
                            />
                        </div>

                        <Button type="submit" className="w-full">
                            Sign Up
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
