import "./globals.css"
import type { Metadata as _Metadata } from "next"
import { Inter } from "next/font/google"
import ToasterProvider from "@/components/ui/ToasterProvider"
import { AuthProvider } from "@/context/AuthContext"
import Navbar from "@/components/layout/navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
    title: "Realtivo",
    description: "Advanced real estate lead management",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AuthProvider>
                    <ToasterProvider />
                    <Navbar />
                    <main className="px-4 max-w-6xl mx-auto">{children}</main>
                </AuthProvider>
            </body>
        </html>
    )
}
