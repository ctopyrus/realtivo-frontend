"use client"

import { useEffect, useState } from "react"
import { fetchAllTags } from "@/lib/api/leads"
import { Button } from "@/components/ui/button"

export function TagSelector({ leadId, onTagAdded }: { leadId: string; onTagAdded: () => void }) {
    const [tags, setTags] = useState<{ id: string; name: string; color: string }[]>([])

    useEffect(() => {
        fetchAllTags().then(setTags).catch(console.error)
    }, [])

    const assignTag = async (tagId: string) => {
        try {
            const res = await fetch(`/api/leads/${leadId}/tags`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tagId }),
            })
            if (res.ok) {
                onTagAdded()
            } else {
                console.error("Failed to assign tag", res.statusText)
            }
        } catch (error) {
            console.error("Error assigning tag:", error)
        }
    }

    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
                <Button
                    key={tag.id}
                    size="sm"
                    variant="outline"
                    style={{ borderColor: tag.color, color: tag.color }}
                    onClick={() => assignTag(tag.id)}
                >
                    + {tag.name}
                </Button>
            ))}
        </div>
    )
}
