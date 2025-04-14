"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/src/lib/hooks/use-auth"
import {AdminSidebar} from "@/src/components/admin/admin-sidebar";

export default function AdminLayout({children}: { children: React.ReactNode }) {
    const { user, loading, isAdmin } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        console.log("Admin layout effect - Auth state:", { user, loading, isAdmin })

        if (!loading && (!user || !isAdmin)) {
            if (pathname !== "/admin/login") {
                console.log("Redirecting to login page - Not authenticated or not admin")
                router.push("/admin/login")
            }
        } else if (!loading && user && isAdmin) {
            console.log("Admin authenticated successfully:", user.email)
        }
    }, [user, loading, isAdmin, router, pathname])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!isAdmin && pathname !== "/admin/login") {
        return null
    }

    if (pathname === "/admin/login") {
        return <>{children}</>
    }

    return (
        <div className="flex h-screen bg-background">
            <AdminSidebar />
            <div className="flex-1 md:ml-64 p-6 overflow-y-auto">{children}</div>
        </div>
    )
}

