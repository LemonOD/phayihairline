import Image from "next/image"
import Link from "next/link"
import { Check } from "lucide-react"

import { Button } from "@/src/components/ui/button"

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      {/* Hero Section */}
      <section className="mb-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-primary">About PhayiHairline</h1>
            <p className="text-lg text-muted-foreground mb-6">
              We are passionate about helping women look and feel their best with premium quality wigs, frontals, and
              professional wigging tools.
            </p>
            <p className="text-lg text-muted-foreground mb-6">
              Founded in 2018, PhayiHairline has grown to become one of the most trusted names in the hair industry in
              Lagos, Nigeria, known for our commitment to quality and customer satisfaction.
            </p>
            <Button asChild size="lg">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
          <div className="relative h-[400px] rounded-lg overflow-hidden shadow-lg">
            <Image
              src="/placeholder.svg?height=800&width=600"
              alt="PhayiHairline store"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="mb-16 bg-muted/30 p-8 rounded-lg">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4 text-primary">Our Mission</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            To provide women with high-quality hair products and exceptional services that enhance their natural beauty
            and boost their confidence.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-background p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-primary">Quality</h3>
            <p className="text-muted-foreground">
              We source only the finest human hair and materials to ensure our products meet the highest standards.
            </p>
          </div>
          <div className="bg-background p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-primary">Affordability</h3>
            <p className="text-muted-foreground">
              We believe quality hair should be accessible, so we offer competitive pricing without compromising on
              quality.
            </p>
          </div>
          <div className="bg-background p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-primary">Customer Service</h3>
            <p className="text-muted-foreground">
              We're dedicated to providing exceptional customer service and expert advice to help you find the perfect
              products.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-10 text-center text-primary">Why Choose PhayiHairline</h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-[500px] rounded-lg overflow-hidden shadow-lg">
            <Image src="/placeholder.svg?height=1000&width=800" alt="Wig styling" fill className="object-cover" />
          </div>
          <div>
            <ul className="space-y-6">
              <li className="flex">
                <div className="mr-4 mt-1">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-primary">Premium Quality Products</h3>
                  <p className="text-muted-foreground">
                    All our wigs and frontals are made with 100% human hair, ensuring a natural look and long-lasting
                    quality.
                  </p>
                </div>
              </li>
              <li className="flex">
                <div className="mr-4 mt-1">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-primary">Expert Installation Services</h3>
                  <p className="text-muted-foreground">
                    Our skilled stylists provide professional wig installation, customization, and styling services.
                  </p>
                </div>
              </li>
              <li className="flex">
                <div className="mr-4 mt-1">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-primary">Wide Selection</h3>
                  <p className="text-muted-foreground">
                    From straight to curly, short to long, we offer a diverse range of styles to suit every preference.
                  </p>
                </div>
              </li>
              <li className="flex">
                <div className="mr-4 mt-1">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-primary">Personalized Consultations</h3>
                  <p className="text-muted-foreground">
                    We offer one-on-one consultations to help you find the perfect wig style, color, and length that
                    complements your features and meets your needs.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-10 text-center text-primary">Meet Our Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-background rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
            <div className="relative h-80">
              <Image src="/placeholder.svg?height=600&width=400" alt="Team member" fill className="object-cover" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-1 text-primary">Oyindamola Fayizat Lemon</h3>
              <p className="text-primary mb-3">Founder & CEO</p>
              <p className="text-muted-foreground">
                With over 10 years of experience in the hair industry, Oyindamola founded PhayiHairline with a vision to
                provide quality hair products to women across Nigeria.
              </p>
            </div>
          </div>
          <div className="bg-background rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
            <div className="relative h-80">
              <Image src="/placeholder.svg?height=600&width=400" alt="Team member" fill className="object-cover" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-1 text-primary">Blessing Adeyemi</h3>
              <p className="text-primary mb-3">Lead Stylist</p>
              <p className="text-muted-foreground">
                Blessing is our expert stylist with a talent for creating stunning, natural-looking wig installations
                and customizations.
              </p>
            </div>
          </div>
          <div className="bg-background rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
            <div className="relative h-80">
              <Image src="/placeholder.svg?height=600&width=400" alt="Team member" fill className="object-cover" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-1 text-primary">Chioma Eze</h3>
              <p className="text-primary mb-3">Customer Service Manager</p>
              <p className="text-muted-foreground">
                Chioma ensures that every customer receives exceptional service and support throughout their
                PhayiHairline experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary text-primary-foreground p-8 md:p-12 rounded-lg text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Look?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Visit our store in Adamo, Ikorodu or shop online to discover our premium collection of wigs, frontals, and
          wigging tools.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="secondary" size="lg">
            <Link href="/products/wigs">Shop Now</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="bg-transparent border-white text-white hover:bg-white/10"
          >
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

