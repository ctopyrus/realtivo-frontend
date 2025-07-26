import "./globals.css"
import { Inter } from "next/font/google"
import ToasterProvider from "@/components/ui/ToasterProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
    title: "Realtivo",
    description: "Advanced real estate lead management",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ToasterProvider />
                {children}
            </body>
        </html>
    )
}
