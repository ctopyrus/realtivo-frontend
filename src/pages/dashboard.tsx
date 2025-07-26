import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import LeadsTable from "@/components/leads/leads-table"

export default function DashboardPage() {
    const { logout } = useAuth()

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold mb-4">Welcome to Realtivo</h1>
                <Button onClick={logout}>Logout</Button>
            </div>
            <LeadsTable />
        </div>
    )
}
