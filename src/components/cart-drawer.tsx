"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {ShoppingCart, Plus, Minus, Trash2} from "lucide-react"

import { Button } from "@/src/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/src/components/ui/sheet"
import { Separator } from "@/src/components/ui/separator"
import { useCart } from "@/src/lib/context/cart-context"
import {formatCurrency} from "@/src/lib/utils";

export default function CartDrawer() {
    const [isOpen, setIsOpen] = useState(false)
    const { cart, removeFromCart, updateQuantity, clearCart } = useCart()

    const totalItems = cart.reduce((total, item) => total + item.quantity, 0)
    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {totalItems > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {totalItems}
            </span>
                    )}
                    <span className="sr-only">Open cart</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col">
                <SheetHeader>
                    <SheetTitle>Your Cart ({totalItems})</SheetTitle>
                </SheetHeader>

                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 py-12">
                        <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-1">Your cart is empty</h3>
                        <p className="text-muted-foreground mb-4 text-center">
                            Looks like you haven't added anything to your cart yet.
                        </p>
                        <Button asChild onClick={() => setIsOpen(false)}>
                            <Link href="/products/wigs">Browse Products</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto py-4">
                            <div className="space-y-4">
                                {cart.map((item) => (
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
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFromCart(item.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Remove</span>
                                                </Button>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center border rounded-md">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-none"
                                                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                        <span className="sr-only">Decrease quantity</span>
                                                    </Button>
                                                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-none"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                        <span className="sr-only">Increase quantity</span>
                                                    </Button>
                                                </div>
                                                <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <div className="space-y-1.5">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>Calculated at checkout</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between font-medium">
                                    <span>Total</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <Button className="w-full" size="lg" asChild onClick={() => setIsOpen(false)}>
                                    <Link href="/checkout">Proceed to Checkout</Link>
                                </Button>
                                <Button variant="outline" className="w-full" onClick={() => clearCart()}>
                                    Clear Cart
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}

