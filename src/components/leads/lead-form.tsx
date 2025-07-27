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
import { useState, useEffect } from "react"

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Phone is required"),
    status: z.enum(["Hot", "Warm", "Cold", "Closed"]).optional(),
    // followUpDate can be undefined or a datetime string in ISO format
    followUpDate: z.string().datetime().optional().or(z.literal("")).nullable(),
})

type FormData = z.infer<typeof formSchema>

interface Props {
    defaultValues?: CreateLeadDto
    onSubmit: (data: CreateLeadDto) => void
    onCancel?: () => void
}

export function LeadForm({ defaultValues, onSubmit, onCancel }: Props) {
    // Use RHF with LeadFormData type and SubmitHandler
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: defaultValues?.name || "",
            email: defaultValues?.email || "",
            phone: defaultValues?.phone || "",
            status: (defaultValues?.status as FormData["status"]) ?? "Cold",
            followUpDate: defaultValues?.followUpDate || "",
        },
    })

    // Parsed followUpDate helper
    const followUpDateValue = form.watch("followUpDate")
    const parsedFollowUpDate = followUpDateValue
        ? parseISO(followUpDateValue)
        : undefined

    // Submit handler converting FormData to CreateLeadDto
    const handleFormSubmit: SubmitHandler<FormData> = (data) => {
        const fullData: CreateLeadDto = {
            ...data,
            content: defaultValues?.content ?? "",
            status: data.status || "Cold", // Ensure status is set
            followUpDate: data.followUpDate ? new Date(data.followUpDate).toISOString() : undefined,
        }
        onSubmit(fullData)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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
                                defaultValue={field.value}
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


// NOTE: Define Note type (adjust fields as per your backend response)
type Note = {
    id: string
    content: string
    createdAt: string
}

interface LeadNotesProps {
    lead?: { id: string }
}

export function LeadNotes({ lead }: LeadNotesProps) {
    const [notes, setNotes] = useState<Note[]>([])
    const [newNote, setNewNote] = useState("")
    const [loadingNotes, setLoadingNotes] = useState(false)

    useEffect(() => {
        if (!lead?.id) return
        const fetchNotes = async () => {
            setLoadingNotes(true)
            try {
                const res = await fetch(`/api/leads/${lead.id}/notes`)
                if (!res.ok) throw new Error("Failed to fetch notes")
                const data = await res.json()
                setNotes(data)
            } catch (err) {
                console.error("Failed to fetch notes:", err)
            } finally {
                setLoadingNotes(false)
            }
        }
        fetchNotes()
    }, [lead?.id])

    const addNote = async () => {
        if (!newNote.trim() || !lead?.id) return
        try {
            const res = await fetch(`/api/leads/${lead.id}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newNote }),
            })
            if (!res.ok) throw new Error("Failed to add note")
            const data = await res.json()
            setNotes([data, ...notes])
            setNewNote("")
        } catch (err) {
            console.error(err)
            // Optionally show error toast or message
        }
    }

    if (!lead?.id) return null

    return (
        <div className="mt-6 border-t pt-4">
            <h3 className="text-md font-semibold mb-2">Activity Notes</h3>

            <div className="flex gap-2 mb-3">
                <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a new note"
                    className="flex-grow border px-2 py-1 rounded text-sm"
                />
                <button
                    onClick={addNote}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                    Add
                </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {loadingNotes ? (
                    <p className="text-gray-500 text-sm">Loading notes...</p>
                ) : notes.length === 0 ? (
                    <p className="text-gray-400 text-sm">No notes yet.</p>
                ) : (
                    notes.map((note) => (
                        <div key={note.id} className="p-2 bg-gray-100 rounded shadow-sm">
                            <p className="text-sm text-gray-800">{note.content}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {new Date(note.createdAt).toLocaleString()}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
