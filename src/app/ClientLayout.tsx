"use client";
import { usePathname } from 'next/navigation';
import {CartProvider} from "@/src/lib/context/cart-context";
import {WishlistProvider} from "@/src/lib/context/wishlist-context";
import {FilterProvider} from "@/src/lib/context/filter-context";
import SiteHeader from "@/src/components/site-header";
import SiteFooter from "@/src/components/site-footer";
import {Toaster} from "sonner";

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith('/admin');

    return (
        <CartProvider>
            <WishlistProvider>
                <FilterProvider>
                    <div className="relative flex min-h-screen flex-col">
                        {!isAdminRoute && <SiteHeader />}
                        <main className="flex-1">{children}</main>
                        {!isAdminRoute && <SiteFooter />}
                        <Toaster />
                    </div>
                </FilterProvider>
            </WishlistProvider>
        </CartProvider>
    );
}
