"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {Heart, ShoppingCart, Trash2} from "lucide-react"

import { Button } from "@/src/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/src/components/ui/sheet"
import { useWishlist } from "@/src/lib/context/wishlist-context"
import { useCart } from "@/src/lib/context/cart-context"
import { useToast } from "@/src/hooks/use-toast"
import {formatCurrency} from "@/src/lib/utils";

export default function WishlistDrawer() {
    const [isOpen, setIsOpen] = useState(false)
    const { wishlist, removeFromWishlist, clearWishlist } = useWishlist()
    const { addToCart } = useCart()
    const { toast } = useToast()

    const handleAddToCart = (item: any) => {
        addToCart(item)
        toast({
            title: "Added to cart",
            description: `${item.name} has been added to your cart.`,
        })
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Heart className="h-5 w-5" />
                    {wishlist.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {wishlist.length}
            </span>
                    )}
                    <span className="sr-only">Open wishlist</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col">
                <SheetHeader>
                    <SheetTitle>Your Wishlist ({wishlist.length})</SheetTitle>
                </SheetHeader>

                {wishlist.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 py-12">
                        <Heart className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-1">Your wishlist is empty</h3>
                        <p className="text-muted-foreground mb-4 text-center">Save items you love for later.</p>
                        <Button asChild onClick={() => setIsOpen(false)}>
                            <Link href="/products/wigs">Browse Products</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto py-4">
                            <div className="space-y-4">
                                {wishlist.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted">
                                            <Image
                                                src={item.image || "/placeholder.svg?height=80&width=80"}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <div>
                                                    <h4 className="font-medium text-sm">{item.name}</h4>
                                                    <p className="text-muted-foreground text-xs">{item.category}</p>
                                                    <p className="font-medium mt-1">{formatCurrency(item.price)}</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => removeFromWishlist(item.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Remove</span>
                                                </Button>
                                            </div>
                                            <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => handleAddToCart(item)}>
                                                <ShoppingCart className="h-4 w-4 mr-2" />
                                                Add to Cart
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <div className="mt-6 space-y-3">
                                <Button variant="outline" className="w-full" onClick={() => clearWishlist()}>
                                    Clear Wishlist
                                </Button>
                                <Button className="w-full" onClick={() => setIsOpen(false)}>
                                    Continue Shopping
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}

