import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
    const { logout } = useAuth()

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Welcome to Realtivo</h1>
            <Button onClick={logout}>Logout</Button>
        </div>
    )
}
