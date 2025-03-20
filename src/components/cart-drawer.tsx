"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Trash, Plus, Minus } from "lucide-react"

import { Button } from "@/src/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/src/components/ui/sheet"
import { Separator } from "@/src/components/ui/separator"
import { useCart } from "@/src/lib/context/cart-context"

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart()

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId)
  }

  const handleIncreaseQuantity = (productId: string, currentQuantity: number) => {
    updateQuantity(productId, currentQuantity + 1)
  }

  const handleDecreaseQuantity = (productId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(productId, currentQuantity - 1)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          <span className="sr-only">Open cart</span>
          {getCartCount() > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
              {getCartCount()}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Your Cart ({getCartCount()} items)
          </SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <div className="bg-muted/50 p-4 rounded-full mb-4">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">Your cart is empty</h3>
            <p className="text-muted-foreground text-center mb-6">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Button asChild onClick={() => setIsOpen(false)}>
              <Link href="/products/wigs">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto py-4">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={item.product.image || "/placeholder.svg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product.category}/${item.product.id}`}
                        className="font-medium hover:text-primary transition-colors line-clamp-1"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.product.name}
                      </Link>
                      <div className="text-sm text-muted-foreground mt-1">
                        ₦{item.product.price.toLocaleString()} × {item.quantity}
                      </div>
                      <div className="flex items-center mt-2">
                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-none"
                            onClick={() => handleDecreaseQuantity(item.product.id, item.quantity)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-none"
                            onClick={() => handleIncreaseQuantity(item.product.id, item.quantity)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 ml-2 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveItem(item.product.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="font-medium">₦{(item.product.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Separator className="mb-4" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₦{getCartTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>₦{getCartTotal().toLocaleString()}</span>
                </div>
              </div>

              <SheetFooter className="mt-6">
                <Button className="w-full" size="lg" onClick={() => setIsOpen(false)}>
                  Proceed to Checkout
                </Button>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

