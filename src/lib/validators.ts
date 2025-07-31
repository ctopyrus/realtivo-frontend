// lib/validators.ts
import { z } from "zod"

export const signupSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

export type SignupSchemaType = z.infer<typeof signupSchema>

export const leadSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional(),
    status: z.enum(["Hot", "Warm", "Cold", "Closed"]).refine(val => !!val, {
        message: "Status is required",
    }),
})

export type LeadSchemaType = z.infer<typeof leadSchema>
