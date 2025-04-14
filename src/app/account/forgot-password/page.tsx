"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { useAuth } from "@/src/lib/hooks/use-auth"
import { useToast } from "@/src/hooks/use-toast"
import { Logo } from "@/src/components/ui/logo"

export default function ForgotPasswordPage() {
    const { sendPasswordResetEmail } = useAuth()
    const { toast } = useToast()
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email) {
            toast({
                title: "Error",
                description: "Please enter your email address",
                variant: "destructive",
            })
            return
        }

        try {
            setLoading(true)
            await sendPasswordResetEmail(email)
            setEmailSent(true)

            toast({
                title: "Email sent",
                description: "Check your email for password reset instructions",
            })
        } catch (error: any) {
            console.error("Password reset error:", error)

            toast({
                title: "Error",
                description: "Failed to send password reset email. Please try again.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-2 text-center">
                    <div className="flex justify-center mb-4">
                        <Link href="/">
                            <Logo size="lg" />
                        </Link>
                    </div>
                    <CardTitle className="text-2xl">Reset Password</CardTitle>
                    <CardDescription>
                        {emailSent
                            ? "Check your email for reset instructions"
                            : "Enter your email to receive a password reset link"}
                    </CardDescription>
                </CardHeader>

                {!emailSent ? (
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Sending..." : "Send Reset Link"}
                            </Button>

                            <div className="text-center text-sm">
                                <Link href="/account/login" className="text-primary hover:underline">
                                    Back to Sign In
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                ) : (
                    <CardContent className="space-y-6">
                        <div className="bg-primary/10 text-primary p-4 rounded-md text-center">
                            <p>We've sent a password reset link to:</p>
                            <p className="font-medium mt-1">{email}</p>
                        </div>

                        <div className="text-center space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Didn't receive the email? Check your spam folder or try again.
                            </p>

                            <Button variant="outline" onClick={() => setEmailSent(false)} className="w-full">
                                Try Again
                            </Button>

                            <div className="text-sm">
                                <Link href="/account/login" className="text-primary hover:underline">
                                    Back to Sign In
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    )
}

