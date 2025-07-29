import { useForm } from "react-hook-form"
import type { SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogFooter } from "@/components/ui/dialog"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form"
import { format, parseISO } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import type { CreateLeadDto } from "@/types/lead"
import { Badge } from "@/components/ui/badge"


const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Phone is required"),
    status: z.enum(["Hot", "Warm", "Cold", "Closed"]).optional(),
    followUpDate: z
        .string()
        .optional()
        .or(z.literal("").nullable()), // allow empty string or undefined or string
})

type FormData = z.infer<typeof formSchema>

interface Props {
    defaultValues?: CreateLeadDto & { leadTags?: { tag: { id: string; name: string; color: string } }[] }
    onSubmit: (data: CreateLeadDto) => void
    onCancel?: () => void
}

export function LeadForm({ defaultValues, onSubmit, onCancel }: Props) {
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: defaultValues?.name ?? "",
            email: defaultValues?.email ?? "",
            phone: defaultValues?.phone ?? "",
            status: (defaultValues?.status as FormData["status"]) ?? "Cold",
            followUpDate: defaultValues?.followUpDate ?? "",
        },
    })

    // Watch and parse followUpDate string to Date
    const followUpDateValue = form.watch("followUpDate")
    const parsedFollowUpDate = followUpDateValue ? parseISO(followUpDateValue) : undefined

    // On submit, convert form data to CreateLeadDto including ISO string for date
    const handleFormSubmit: SubmitHandler<FormData> = (data) => {
        const fullData: CreateLeadDto = {
            ...data,
            content: defaultValues?.content ?? "",
            status: data.status || "Cold",
            followUpDate: data.followUpDate ? new Date(data.followUpDate).toISOString() : undefined,
        }
        onSubmit(fullData)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                {/* Render lead tags badges above form if any */}
                {defaultValues?.leadTags?.length ? (
                    <div className="flex flex-wrap mb-4">
                        {defaultValues.leadTags.map((leadTag) => (
                            <Badge
                                key={leadTag.tag.id}
                                className="mr-2 mb-2"
                                style={{ backgroundColor: leadTag.tag.color }}
                            >
                                {leadTag.tag.name}
                            </Badge>
                        ))}
                    </div>
                ) : null}

                {/* Status Select */}
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Hot">🔥 Hot</SelectItem>
                                    <SelectItem value="Warm">🌤️ Warm</SelectItem>
                                    <SelectItem value="Cold">❄️ Cold</SelectItem>
                                    <SelectItem value="Closed">✅ Closed</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Name Input */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Name" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Email Input */}
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Email" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Phone Input */}
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Phone" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Follow-Up Date Picker */}
                <FormField
                    control={form.control}
                    name="followUpDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Follow-Up Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {field.value && parsedFollowUpDate ? (
                                            format(parsedFollowUpDate, "PPP")
                                        ) : (
                                            <span>Select date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={parsedFollowUpDate}
                                        onSelect={(date) => {
                                            if (date) {
                                                field.onChange(date.toISOString())
                                            } else {
                                                field.onChange("")
                                            }
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <DialogFooter>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {defaultValues ? "Update Lead" : "Add Lead"}
                    </Button>
                    {onCancel && (
                        <Button variant="outline" type="button" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                </DialogFooter>
            </form>
        </Form>
    )
}
