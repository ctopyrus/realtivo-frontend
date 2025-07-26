import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogFooter } from "@/components/ui/dialog"
import type { CreateLeadDto } from "@/types/lead"

const schema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Phone is required"),
})

type FormData = z.infer<typeof schema>

interface Props {
    defaultValues?: CreateLeadDto
    onSubmit: (data: CreateLeadDto) => void
    onCancel?: () => void
}

export function LeadForm({ defaultValues, onSubmit, onCancel }: Props) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues,
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <Input {...register("name")} placeholder="Name" />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            <div>
                <Input {...register("email")} placeholder="Email" />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <div>
                <Input {...register("phone")} placeholder="Phone" />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
            </div>
            <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                    {defaultValues ? "Update Lead" : "Add Lead"}
                </Button>
                {onCancel && (
                    <Button variant="outline" type="button" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
            </DialogFooter>
        </form>
    )
}
