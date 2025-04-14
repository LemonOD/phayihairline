"use client"

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    updateProfile as firebaseUpdateProfile,
    sendPasswordResetEmail as firebaseSendPasswordResetEmail,
    User as FirebaseUser,
} from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/src/lib/firebase/config"

type User = {
    uid: string
    email: string | null
    displayName: string | null
    photoURL?: string | null
    createdAt?: string
}

type AuthContextType = {
    user: User | null
    loading: boolean
    isAdmin: boolean
    signIn: (email: string, password: string) => Promise<void>
    signOut: () => Promise<void>
    createUser: (email: string, password: string, name?: string) => Promise<void>
    updateProfile: (data: Partial<User>) => Promise<void>
    sendPasswordResetEmail: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: false,
    isAdmin: false,
    signIn: async () => {},
    signOut: async () => {},
    createUser: async () => {},
    updateProfile: async () => {},
    sendPasswordResetEmail: async () => {},
})

// Helper function to convert Firebase user to our User type
const formatUser = (user: FirebaseUser): User => {
    return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser(formatUser(firebaseUser))
            } else {
                setUser(null)
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const isAdmin = React.useMemo(() => {
        const adminStatus = Boolean(user?.email?.endsWith("@admin.com") || user?.email === "admin@phayihairline.com")
        console.log("Admin status check:", { email: user?.email, isAdmin: adminStatus })
        return adminStatus
    }, [user?.email])

    const signIn = async (email: string, password: string) => {
        console.log("signIn function called with email:", email)
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("Firebase signIn successful:", userCredential.user.uid)
            setUser(formatUser(userCredential.user));
            return userCredential;
        } catch (error) {
            console.error("Sign-in error:", error);
            throw error;
        }
    };

    const signOut = async () => {
        await firebaseSignOut(auth)
    }

    const createUser = async (email: string, password: string, name?: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)

        if (name && auth.currentUser) {
            await firebaseUpdateProfile(auth.currentUser, {
                displayName: name
            })
        }

        const userRef = doc(db, "users", userCredential.user.uid)
        await setDoc(userRef, {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: name || email.split("@")[0],
            createdAt: serverTimestamp(),
            role: "customer"
        })
    }

    const updateProfile = async (data: Partial<User>) => {
        if (auth.currentUser) {
            if (data.displayName) {
                await firebaseUpdateProfile(auth.currentUser, {
                    displayName: data.displayName
                })
            }

            const userRef = doc(db, "users", auth.currentUser.uid)
            await setDoc(userRef, {
                ...data,
                updatedAt: serverTimestamp()
            }, { merge: true })
        }
    }

    const sendPasswordResetEmail = async (email: string) => {
        await firebaseSendPasswordResetEmail(auth, email)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAdmin,
                signIn,
                signOut,
                createUser,
                updateProfile,
                sendPasswordResetEmail,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
