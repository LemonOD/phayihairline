import { NextResponse } from "next/server"
import { createAdminAccount } from "@/src/lib/firebase/admin-setup"

// This is a protected route that should only be accessible in development
// In production, you should remove this route or add proper authentication
export async function POST(request: Request) {
    // Only allow in development environment
    if (process.env.NODE_ENV !== "development") {
        return NextResponse.json({ error: "Not available in production" }, { status: 403 })
    }

    try {
        const { email, password, name } = await request.json()

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
        }

        await createAdminAccount(email, password, name || "Admin")

        return NextResponse.json({ success: true, message: "Admin account created successfully" })
    } catch (error: any) {
        console.error("Error in create-admin API route:", error)
        return NextResponse.json(
            {
                success: false,
                message: "Failed to create admin account",
                error: error.message,
            },
            { status: 500 },
        )
    }
}
