import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/src/lib/firebase/config"

// This function can be used to create an admin account
// You should only use this once to set up your admin account
export async function createAdminAccount(email: string, password: string, name = "Admin") {
    try {
        // Create the user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)

        // Update profile with display name
        await updateProfile(userCredential.user, {
            displayName: name,
        })

        // Create user document in Firestore with admin role
        const userRef = doc(db, "users", userCredential.user.uid)
        await setDoc(userRef, {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: name,
            createdAt: serverTimestamp(),
            role: "admin", // Set role as admin
        })

        console.log("Admin account created successfully")
        return userCredential.user
    } catch (error) {
        console.error("Error creating admin account:", error)
        throw error
    }
}
