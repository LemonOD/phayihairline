import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    limit,
    orderBy,
    serverTimestamp,
    type DocumentData,
    type QueryDocumentSnapshot,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "@/src/lib/firebase/config"

export type Product = {
    id: string
    name: string
    description: string
    price: number
    originalPrice?: number | null
    discount: number
    category: string
    image: string
    images: string[]
    features: string[]
    stock: number
    rating: number
    reviews: number
    tags: string[]
    createdAt?: any
    updatedAt?: any
}

// Convert Firestore document to Product type
const convertProduct = (doc: QueryDocumentSnapshot<DocumentData>): Product => {
    const data = doc.data()
    return {
        id: doc.id,
        name: data.name || "",
        description: data.description || "",
        price: data.price || 0,
        originalPrice: data.originalPrice || null,
        discount: data.discount || 0,
        category: data.category || "",
        image: data.image || "",
        images: data.images || [],
        features: data.features || [],
        stock: data.stock || 0,
        rating: data.rating || 0,
        reviews: data.reviews || 0,
        tags: data.tags || [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    }
}

// Get all products
export const getAllProducts = async (): Promise<Product[]> => {
    const productsRef = collection(db, "products")
    const productsSnapshot = await getDocs(productsRef)
    return productsSnapshot.docs.map(convertProduct)
}

// Get products by category
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
    const productsRef = collection(db, "products")
    const q = query(productsRef, where("category", "==", category))
    const productsSnapshot = await getDocs(q)
    return productsSnapshot.docs.map(convertProduct)
}

// Get featured products
export const getFeaturedProducts = async (limitCount = 8): Promise<Product[]> => {
    const productsRef = collection(db, "products")
    const q = query(productsRef, orderBy("rating", "desc"), limit(limitCount))
    const productsSnapshot = await getDocs(q)
    return productsSnapshot.docs.map(convertProduct)
}

// Get product by ID
export const getProductById = async (id: string): Promise<Product | null> => {
    const productRef = doc(db, "products", id)
    const productSnapshot = await getDoc(productRef)

    if (!productSnapshot.exists()) {
        return null
    }

    return {
        id: productSnapshot.id,
        ...productSnapshot.data(),
    } as Product
}

// Create a new product
export const createProduct = async (productData: Omit<Product, "id">): Promise<string> => {
    const productsRef = collection(db, "products")
    const newProduct = {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(productsRef, newProduct)
    return docRef.id
}

// Update a product
export const updateProduct = async (id: string, productData: Partial<Product>): Promise<void> => {
    const productRef = doc(db, "products", id)
    await updateDoc(productRef, {
        ...productData,
        updatedAt: serverTimestamp(),
    })
}

// Delete a product
export const deleteProduct = async (id: string): Promise<void> => {
    const productRef = doc(db, "products", id)
    await deleteDoc(productRef)
}

export const uploadProductImage = async (file: File, productId: string, index = 0): Promise<string> => {
    const fileExtension = file.name.split(".").pop()
    const fileName = `${productId}_${index}.${fileExtension}`
    const storageRef = ref(storage, `products/${fileName}`)

    await uploadBytes(storageRef, file)
    return await getDownloadURL(storageRef)

}

export const deleteProductImage = async (imageUrl: string): Promise<void> => {
    const urlPath = decodeURIComponent(imageUrl.split("?")[0].split("/o/")[1])
    const storageRef = ref(storage, urlPath)

    await deleteObject(storageRef)
}
