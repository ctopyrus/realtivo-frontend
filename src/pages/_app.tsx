import "@/styles/globals.css"
import type { AppProps } from "next/app"
import ToasterProvider from "@/components/ui/ToasterProvider"

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <ToasterProvider />
            <Component {...pageProps} />
        </>
    )
}

export default MyApp
