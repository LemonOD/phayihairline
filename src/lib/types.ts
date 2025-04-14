export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice: number
  discount: number
  image: string
  category: string
  inStock: boolean
  rating: number
  reviews: number
  features: string[]
  createdAt?: any // Firestore timestamp
  updatedAt?: any // Firestore timestamp
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'admin' | 'customer';
}

