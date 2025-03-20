"use client"

import { useState } from "react"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Check,
  Truck,
  RotateCcw,
  Shield,
} from "lucide-react"

import { Button } from "@/src/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { featuredWigs, featuredFrontals, featuredTools } from "@/src/lib/products"
import { useCart } from "@/src/lib/context/cart-context"
import { useWishlist } from "@/src/lib/context/wishlist-context"
import { useToast } from "@/src/hooks/use-toast"

export default function ProductPage({ params }: { params: { category: string; id: string } }) {
  const { category, id } = params
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { toast } = useToast()

  // Find the product
  const allProducts = [...featuredWigs, ...featuredFrontals, ...featuredTools]
  const product = allProducts.find((p) => p.id === id && p.category === category)

  if (!product) {
    return notFound()
  }

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const handleAddToCart = () => {
    addToCart(product, quantity)
    toast({
      title: "Added to cart",
      description: `${quantity} ${quantity > 1 ? "items" : "item"} added to your cart.`,
    })
  }

  const handleToggleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      })
    } else {
      addToWishlist(product)
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`,
      })
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted-foreground mb-6">
        <Link href="/public" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link href="/products" className="hover:text-primary">
          Products
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link href={`/products/${category}`} className="hover:text-primary capitalize">
          {category}
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-foreground font-medium truncate max-w-[150px]">{product.name}</span>
      </div>

      {/* Product Details */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div>
          <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden mb-4">
            <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            {product.discount > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                {product.discount}% OFF
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="relative h-24 rounded-md overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary"
              >
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={`${product.name} view ${i}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>

          <div className="flex items-center mb-4">
            <div className="flex items-center mr-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-primary text-primary" : "fill-muted text-muted-foreground"}`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">{product.reviews} reviews</span>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">₦{product.price.toLocaleString()}</span>
              {product.originalPrice > 0 && (
                <span className="text-muted-foreground line-through">₦{product.originalPrice.toLocaleString()}</span>
              )}
              {product.discount > 0 && (
                <span className="text-red-500 text-sm font-medium">Save {product.discount}%</span>
              )}
            </div>
            <p className="text-sm text-green-600 mt-1">In Stock</p>
          </div>

          <p className="text-muted-foreground mb-6">{product.description}</p>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Features:</h3>
            <ul className="space-y-1">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className="mr-6">
                <label htmlFor="quantity" className="block text-sm font-medium mb-1">
                  Quantity
                </label>
                <div className="flex items-center border rounded-md">
                  <button onClick={decrementQuantity} className="px-3 py-2 text-muted-foreground hover:text-primary">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-3 py-2 w-12 text-center">{quantity}</span>
                  <button onClick={incrementQuantity} className="px-3 py-2 text-muted-foreground hover:text-primary">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex-1 gap-2" onClick={handleAddToCart}>
                <ShoppingCart className="h-5 w-5" /> Add to Cart
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={isInWishlist(product.id) ? "text-red-500 hover:text-red-600" : ""}
                onClick={handleToggleWishlist}
              >
                <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <div className="flex items-start">
              <Truck className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium">Free Delivery</h4>
                <p className="text-sm text-muted-foreground">
                  Free delivery within Ikorodu. Delivery fees apply for other locations.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <RotateCcw className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium">7-Day Returns</h4>
                <p className="text-sm text-muted-foreground">Return unused items within 7 days for a full refund.</p>
              </div>
            </div>
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium">Quality Guarantee</h4>
                <p className="text-sm text-muted-foreground">
                  All our products are guaranteed to be of the highest quality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="p-6 border rounded-b-lg mt-2">
            <div className="prose max-w-none">
              <p>
                {product.description} Our {product.name} is made with premium quality materials to ensure durability and
                satisfaction.
              </p>
              <p className="mt-4">
                Whether you're looking for a new style or want to enhance your current look, this{" "}
                {category.slice(0, -1)} is perfect for any occasion.
              </p>
              <p className="mt-4">
                Each product is carefully inspected to ensure it meets our high standards before being shipped to you.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="specifications" className="p-6 border rounded-b-lg mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Product Specifications</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Premium quality materials</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                    <span>Durable and long-lasting</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Care Instructions</h3>
                <p className="text-muted-foreground mb-4">
                  To ensure the longevity of your {category.slice(0, -1)}, follow these care instructions:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Handle with care to avoid damage</li>
                  <li>• Store in a cool, dry place</li>
                  <li>• Clean according to product-specific instructions</li>
                  <li>• Avoid excessive heat or direct sunlight</li>
                </ul>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="p-6 border rounded-b-lg mt-2">
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="flex items-center mr-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(product.rating) ? "fill-primary text-primary" : "fill-muted text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <span className="text-lg font-medium">{product.rating} out of 5</span>
              </div>
              <p className="text-muted-foreground">{product.reviews} customer reviews</p>
            </div>

            <div className="space-y-6">
              <div className="border-b pb-6">
                <div className="flex items-center mb-2">
                  <div className="flex items-center mr-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < 5 ? "fill-primary text-primary" : "fill-muted text-muted-foreground"}`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">Amara Johnson</span>
                  <span className="text-muted-foreground text-sm ml-auto">2 weeks ago</span>
                </div>
                <p className="text-muted-foreground">
                  I absolutely love this {category.slice(0, -1)}! The quality is exceptional and it looks so natural.
                  I've received so many compliments. Definitely worth the investment.
                </p>
              </div>

              <div className="border-b pb-6">
                <div className="flex items-center mb-2">
                  <div className="flex items-center mr-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < 4 ? "fill-primary text-primary" : "fill-muted text-muted-foreground"}`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">Chioma Okafor</span>
                  <span className="text-muted-foreground text-sm ml-auto">1 month ago</span>
                </div>
                <p className="text-muted-foreground">
                  Great product for the price. The shipping was fast and the customer service was excellent. I would
                  definitely recommend this to anyone looking for a quality {category.slice(0, -1)}.
                </p>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <div className="flex items-center mr-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < 5 ? "fill-primary text-primary" : "fill-muted text-muted-foreground"}`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">Blessing Adeyemi</span>
                  <span className="text-muted-foreground text-sm ml-auto">2 months ago</span>
                </div>
                <p className="text-muted-foreground">
                  This is my second purchase from PhayiHairline and I'm just as impressed as I was with my first. The
                  quality is consistent and the customer service is top-notch. Highly recommend!
                </p>
              </div>
            </div>

            <div className="mt-8">
              <Button>Write a Review</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {allProducts
            .filter((p) => p.category === category && p.id !== id)
            .slice(0, 4)
            .map((relatedProduct) => (
              <div
                key={relatedProduct.id}
                className="group bg-background rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                <Link href={`/products/${relatedProduct.category}/${relatedProduct.id}`}>
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={relatedProduct.image || "/placeholder.svg"}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {relatedProduct.discount > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {relatedProduct.discount}% OFF
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <Link href={`/products/${relatedProduct.category}/${relatedProduct.id}`}>
                    <h3 className="font-medium text-lg mb-1 group-hover:text-primary transition-colors">
                      {relatedProduct.name}
                    </h3>
                  </Link>
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">₦{relatedProduct.price.toLocaleString()}</span>
                      {relatedProduct.originalPrice > 0 && (
                        <span className="text-muted-foreground line-through text-sm">
                          ₦{relatedProduct.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    className="w-full gap-2"
                    onClick={() => {
                      addToCart(relatedProduct, 1)
                      toast({
                        title: "Added to cart",
                        description: `${relatedProduct.name} has been added to your cart.`,
                      })
                    }}
                  >
                    <ShoppingCart className="h-4 w-4" /> Add to Cart
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

