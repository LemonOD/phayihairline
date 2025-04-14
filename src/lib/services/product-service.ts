import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/src/lib/firebase/config';
import type { Product } from '@/src/lib/types';

const productsCollection = collection(db, 'products');

// Get all products
export async function getAllProducts(): Promise<Product[]> {
    try {
        const snapshot = await getDocs(query(productsCollection, orderBy('createdAt', 'desc')));
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Product));
    } catch (error) {
        console.error("Error getting all products:", error);
        return [];
    }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
    try {
        const q = query(
            productsCollection,
            where('category', '==', category),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Product));
    } catch (error) {
        console.error(`Error getting products by category ${category}:`, error);
        return [];
    }
}

export async function getProductById(id: string): Promise<Product | null> {
    try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            } as Product;
        }

        return null;
    } catch (error) {
        console.error(`Error getting product by ID ${id}:`, error);
        return null;
    }
}

// Create a new product
export async function createProduct(productData: Omit<Product, 'id'>): Promise<string> {
    try {
        const docRef = await addDoc(productsCollection, {
            ...productData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return docRef.id;
    } catch (error) {
        console.error("Error creating product:", error);
        throw error;
    }
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<void> {
    try {
        const productRef = doc(db, 'products', id);

        // Update product document
        await updateDoc(productRef, {
            ...productData,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error(`Error updating product ${id}:`, error);
        throw error;
    }
}

export async function deleteProduct(id: string): Promise<void> {
    try {
        const product = await getProductById(id);

        if (!product) {
            throw new Error('Product not found');
        }

        // Delete product image if it exists
        if (product.image && product.image.startsWith('https://')) {
            try {
                const imageRef = ref(storage, product.image);
                await deleteObject(imageRef);
            } catch (error) {
                console.error("Error deleting product image:", error);
            }
        }

        // Delete product document
        await deleteDoc(doc(db, 'products', id));
    } catch (error) {
        console.error(`Error deleting product ${id}:`, error);
        throw error;
    }
}

export async function uploadProductImage(file: File): Promise<string> {
    try {
        const imageRef = ref(storage, `products/${Date.now()}_${file.name}`);
        await uploadBytes(imageRef, file);
        return await getDownloadURL(imageRef);
    } catch (error) {
        console.error("Error uploading product image:", error);
        throw error;
    }
}

export async function getFeaturedProducts(category: string, limit = 4): Promise<Product[]> {
    try {
        const q = query(
            productsCollection,
            where('category', '==', category),
            orderBy('rating', 'desc'),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Product))
            .slice(0, limit);
    } catch (error) {
        console.error(`Error getting featured products for category ${category}:`, error);
        return [];
    }
}

export async function seedProducts(products: Omit<Product, 'id'>[]): Promise<void> {
    try {
        for (const product of products) {
            await createProduct(product);
        }
    } catch (error) {
        console.error("Error seeding products:", error);
        throw error;
    }
}
