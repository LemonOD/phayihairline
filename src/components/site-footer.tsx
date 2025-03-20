import Link from "next/link"
import {Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"

export default function SiteFooter() {
  return (
    <footer className="bg-muted/40 border-t">
      <div className="container px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">PhayiHairline</h3>
            <p className="text-muted-foreground mb-6">
              Premium quality wigs, frontals, and wigging tools for the modern woman.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/public" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products/wigs" className="text-muted-foreground hover:text-primary transition-colors">
                  Wigs
                </Link>
              </li>
              <li>
                <Link href="/products/frontals" className="text-muted-foreground hover:text-primary transition-colors">
                  Frontals
                </Link>
              </li>
              <li>
                <Link href="/products/tools" className="text-muted-foreground hover:text-primary transition-colors">
                  Wigging Tools
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-muted-foreground hover:text-primary transition-colors">
                  Services
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-0.5 text-primary" />
                <span className="text-muted-foreground">Adamo, Ikorodu, Lagos State, Nigeria</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-primary" />
                <span className="text-muted-foreground">08155217967</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-primary" />
                <span className="text-muted-foreground">info@phayihairline.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Newsletter</h3>
            <p className="text-muted-foreground mb-4">
              Subscribe to our newsletter for the latest products and offers.
            </p>
            <div className="flex flex-col space-y-2">
              <Input type="email" placeholder="Your email address" />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="border-t mt-12 pt-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PhayiHairline. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

