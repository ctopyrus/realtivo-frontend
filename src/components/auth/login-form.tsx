import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import axios from "axios"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import type { SubmitHandler } from "react-hook-form"

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

type LoginFormInputs = z.infer<typeof schema>

export function LoginForm() {
    const { login } = useAuth()
    const [error, setError] = useState("")
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormInputs>({
        resolver: zodResolver(schema)
    })

    const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
        try {
            const res = await axios.post("http://localhost:3000/auth/login", data)
            // Assuming res.data contains user info and access_token
            const user = res.data.user || {} // adjust based on your API response
            login(res.data.access_token, user)
            localStorage.setItem("token", res.data.access_token)
            window.location.href = "/dashboard"
        } catch (err: any) {
            setError("Invalid credentials")
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <Label>Email</Label>
                <Input {...register("email")} type="email" />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <div>
                <Label>Password</Label>
                <Input {...register("password")} type="password" />
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full">Login</Button>
        </form>
    )
}
