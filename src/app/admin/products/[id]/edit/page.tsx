"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { useToast } from "@/src/hooks/use-toast"
import { ArrowLeft, Upload, X, Plus, Loader2 } from "lucide-react"
import {
    getProductById,
    updateProduct,
    uploadProductImage,
    deleteProductImage,
    type Product,
} from "@/src/lib/firebase/products"

export default function EditProductPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const { toast } = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [product, setProduct] = useState<Product | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        price: "",
        originalPrice: "",
        discount: "0",
        stock: "",
        description: "",
        features: [""],
        tags: [""],
    })
    const [existingImages, setExistingImages] = useState<string[]>([])
    const [newImages, setNewImages] = useState<File[]>([])
    const [newImagePreviewUrls, setNewImagePreviewUrls] = useState<string[]>([])
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

    // Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const productData = await getProductById(params.id)
                if (productData) {
                    setProduct(productData)
                    setFormData({
                        name: productData.name,
                        category: productData.category,
                        price: productData.price.toString(),
                        originalPrice: productData.originalPrice ? productData.originalPrice.toString() : "",
                        discount: productData.discount.toString(),
                        stock: productData.stock.toString(),
                        description: productData.description,
                        features: productData.features.length > 0 ? productData.features : [""],
                        tags: productData.tags.length > 0 ? productData.tags : [""],
                    })
                    setExistingImages(productData.images)
                } else {
                    toast({
                        title: "Error",
                        description: "Product not found",
                        variant: "destructive",
                    })
                    router.push("/admin/products")
                }
            } catch (error) {
                console.error("Error fetching product:", error)
                toast({
                    title: "Error",
                    description: "Failed to load product data. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchProduct()
    }, [params.id, router, toast])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleFeatureChange = (index: number, value: string) => {
        const updatedFeatures = [...formData.features]
        updatedFeatures[index] = value
        setFormData((prev) => ({ ...prev, features: updatedFeatures }))
    }

    const addFeature = () => {
        setFormData((prev) => ({ ...prev, features: [...prev.features, ""] }))
    }

    const removeFeature = (index: number) => {
        const updatedFeatures = [...formData.features]
        updatedFeatures.splice(index, 1)
        setFormData((prev) => ({ ...prev, features: updatedFeatures }))
    }

    const handleTagChange = (index: number, value: string) => {
        const updatedTags = [...formData.tags]
        updatedTags[index] = value
        setFormData((prev) => ({ ...prev, tags: updatedTags }))
    }

    const addTag = () => {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, ""] }))
    }

    const removeTag = (index: number) => {
        const updatedTags = [...formData.tags]
        updatedTags.splice(index, 1)
        setFormData((prev) => ({ ...prev, tags: updatedTags }))
    }

    const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files)

            // Create preview URLs for the new files
            const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file))

            setNewImages((prev) => [...prev, ...newFiles])
            setNewImagePreviewUrls((prev) => [...prev, ...newPreviewUrls])
        }
    }

    const removeNewImage = (index: number) => {
        // Revoke the object URL to avoid memory leaks
        URL.revokeObjectURL(newImagePreviewUrls[index])

        const updatedImages = [...newImages]
        updatedImages.splice(index, 1)

        const updatedPreviewUrls = [...newImagePreviewUrls]
        updatedPreviewUrls.splice(index, 1)

        setNewImages(updatedImages)
        setNewImagePreviewUrls(updatedPreviewUrls)
    }

    const removeExistingImage = (url: string) => {
        setExistingImages((prev) => prev.filter((img) => img !== url))
        setImagesToDelete((prev) => [...prev, url])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate form
        if (!formData.name || !formData.category || !formData.price || !formData.stock) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            })
            return
        }

        if (existingImages.length === 0 && newImages.length === 0) {
            toast({
                title: "Validation Error",
                description: "Please upload at least one product image",
                variant: "destructive",
            })
            return
        }

        try {
            setIsSubmitting(true)

            // Calculate discount percentage if original price is provided
            let discountPercentage = Number.parseInt(formData.discount)
            if (formData.originalPrice && !discountPercentage) {
                const price = Number.parseFloat(formData.price)
                const originalPrice = Number.parseFloat(formData.originalPrice)
                if (originalPrice > price) {
                    discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100)
                }
            }

            // Delete images marked for deletion
            await Promise.all(imagesToDelete.map((url) => deleteProductImage(url)))

            // Upload new images
            const newImageUrls = await Promise.all(
                newImages.map((file, index) => uploadProductImage(file, params.id, existingImages.length + index)),
            )

            // Combine existing and new image URLs
            const allImageUrls = [...existingImages, ...newImageUrls]

            // Update product in Firestore
            const productData = {
                name: formData.name,
                description: formData.description,
                price: Number.parseFloat(formData.price),
                originalPrice: formData.originalPrice ? Number.parseFloat(formData.originalPrice) : null,
                discount: discountPercentage,
                category: formData.category,
                image: allImageUrls[0] || "", // First image as main image
                images: allImageUrls,
                features: formData.features.filter((feature) => feature.trim() !== ""),
                stock: Number.parseInt(formData.stock),
                tags: formData.tags.filter((tag) => tag.trim() !== ""),
            }

            await updateProduct(params.id, productData)

            toast({
                title: "Success",
                description: "Product has been updated successfully",
            })

            router.push("/admin/products")
        } catch (error) {
            console.error("Error updating product:", error)
            toast({
                title: "Error",
                description: "Failed to update product. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading product data...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Product Information</CardTitle>
                            <CardDescription>Update the information about the product</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Brazilian Body Wave Wig"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Wigs">Wigs</SelectItem>
                                        <SelectItem value="Frontals">Frontals</SelectItem>
                                        <SelectItem value="Tools">Tools</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price (₦) *</Label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="e.g. 45000"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="originalPrice">Original Price (₦)</Label>
                                    <Input
                                        id="originalPrice"
                                        name="originalPrice"
                                        type="number"
                                        value={formData.originalPrice}
                                        onChange={handleChange}
                                        placeholder="e.g. 55000"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="discount">Discount (%)</Label>
                                    <Input
                                        id="discount"
                                        name="discount"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.discount}
                                        onChange={handleChange}
                                        placeholder="e.g. 10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stock">Stock Quantity *</Label>
                                    <Input
                                        id="stock"
                                        name="stock"
                                        type="number"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        placeholder="e.g. 10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe the product..."
                                    rows={5}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Product Features</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Feature
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {formData.features.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                value={feature}
                                                onChange={(e) => handleFeatureChange(index, e.target.value)}
                                                placeholder="e.g. 100% Human Hair"
                                            />
                                            {formData.features.length > 1 && (
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(index)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Product Tags</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addTag}>
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Tag
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {formData.tags.map((tag, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                value={tag}
                                                onChange={(e) => handleTagChange(index, e.target.value)}
                                                placeholder="e.g. body wave"
                                            />
                                            {formData.tags.length > 1 && (
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeTag(index)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Product Images</CardTitle>
                            <CardDescription>Manage product images</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Existing Images */}
                            {existingImages.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Current Images</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {existingImages.map((url, index) => (
                                            <div key={index} className="relative aspect-square bg-muted rounded-md overflow-hidden group">
                                                <Image
                                                    src={url || "/placeholder.svg"}
                                                    alt={`Product image ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeExistingImage(url)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                                {index === 0 && (
                                                    <div className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-xs text-center py-1">
                                                        Main Image
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upload New Images */}
                            <div
                                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="flex flex-col items-center justify-center space-y-2">
                                    <div className="bg-muted/50 rounded-full p-3">
                                        <Upload className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div className="text-sm font-medium">Upload additional images</div>
                                    <div className="text-xs text-muted-foreground">PNG, JPG or WEBP up to 5MB</div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            fileInputRef.current?.click()
                                        }}
                                    >
                                        Browse Files
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleNewImageChange}
                                    />
                                </div>
                            </div>

                            {/* New Image Previews */}
                            {newImagePreviewUrls.length > 0 && (
                                <div className="space-y-2">
                                    <Label>New Images</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {newImagePreviewUrls.map((url, index) => (
                                            <div key={index} className="relative aspect-square bg-muted rounded-md overflow-hidden group">
                                                <Image
                                                    src={url || "/placeholder.svg"}
                                                    alt={`New product image ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeNewImage(index)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <CardFooter className="flex justify-end space-x-4 mt-6 px-0">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => router.push("/admin/products")}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Updating..." : "Update Product"}
                    </Button>
                </CardFooter>
            </form>
        </div>
    )
}

