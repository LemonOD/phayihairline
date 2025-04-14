import { db } from "@/src/lib/firebase/config"
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import { products } from "@/src/lib/data"

export async function initializeFirestoreData() {
    try {
        // Check if products already exist
        const productsRef = collection(db, "products")
        const snapshot = await getDocs(productsRef)

        if (snapshot.empty) {
            console.log("Initializing Firestore with product data...")

            // Add products to Firestore
            for (const product of products) {
                const { id, ...productData } = product

                await addDoc(productsRef, {
                    ...productData,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                })
            }

            console.log("Product data initialized successfully!")
            return { success: true, message: "Product data initialized successfully!" }
        } else {
            console.log("Products already exist in Firestore. Skipping initialization.")
            return { success: true, message: "Products already exist in Firestore. Skipping initialization." }
        }
    } catch (error) {
        console.error("Error initializing Firestore data:", error)
        return { success: false, message: "Error initializing Firestore data", error }
    }
}

