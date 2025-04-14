"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { useToast } from "@/src/hooks/use-toast"
import { Loader2 } from "lucide-react"

export function DataInitializer() {
    const { toast } = useToast()
    const [isInitializing, setIsInitializing] = useState(false)

    const handleInitializeData = async () => {
        if (
            window.confirm(
                "Are you sure you want to initialize the database with sample data? This should only be done once.",
            )
        ) {
            try {
                setIsInitializing(true)

                const response = await fetch("/api/init-data")
                const data = await response.json()

                if (data.success) {
                    toast({
                        title: "Success",
                        description: data.message,
                    })
                } else {
                    throw new Error(data.message || "Failed to initialize data")
                }
            } catch (error) {
                console.error("Error initializing data:", error)
                toast({
                    title: "Error",
                    description: "Failed to initialize data. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setIsInitializing(false)
            }
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Database Initialization</CardTitle>
                <CardDescription>Initialize your database with sample product data</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                    This action will populate your Firestore database with sample product data if it doesn't already exist. This
                    should only be done once when setting up your store.
                </p>
            </CardContent>
            <CardFooter>
                <Button onClick={handleInitializeData} disabled={isInitializing} className="w-full">
                    {isInitializing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Initializing...
                        </>
                    ) : (
                        "Initialize Database"
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}

