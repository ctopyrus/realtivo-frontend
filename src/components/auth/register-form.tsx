import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import axios from "axios"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export function RegisterForm() {
    const [error, setError] = useState("")
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({ resolver: zodResolver(schema) })

    const onSubmit = async (data: any) => {
        try {
            const res = await axios.post("http://localhost:3000/auth/register", data)
            console.log(res.data)
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
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message as string}</p>}
            </div>
            <div>
                <Label>Password</Label>
                <Input {...register("password")} type="password" />
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message as string}</p>}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full">Login</Button>
        </form>
    )
}
