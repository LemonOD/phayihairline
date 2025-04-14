import { NextResponse } from "next/server"
import { initializeFirestoreData } from "@/src/lib/firebase/init-data"

export async function GET() {
    try {
        const result = await initializeFirestoreData()

        return NextResponse.json(result)
    } catch (error) {
        console.error("Error in init-data API route:", error)
        return NextResponse.json({ success: false, message: "Failed to initialize data" }, { status: 500 })
    }
}

