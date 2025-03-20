import Link from "next/link"
import Image from "next/image"
import { ShoppingBag, ChevronRight } from "lucide-react"

import { Button } from "@/src/components/ui/button"
import { AnimatedGradientBorder } from "@/src/components/ui-enhancements/animated-gradient-border"
import ProductCard from "@/src/components/product-card"
import { featuredWigs, featuredFrontals, featuredTools } from "@/src/lib/products"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] md:h-[70vh]">
        <Image
          src="/placeholder.svg?height=800&width=1200"
          alt="Beautiful woman wearing a wig"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-4">
          <h1 className="text-3xl md:text-5xl font-bold text-center mb-4">Premium Quality Wigs & Hair Products</h1>
          <p className="text-lg md:text-xl text-center mb-6 max-w-2xl">
            Elevate your look with our premium wigs, frontals, and professional tools
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="/products/wigs">
                Shop Wigs <ShoppingBag className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-white/10 text-white border-white hover:bg-white/20"
            >
              <Link href="/services">Wig Installation Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 px-4 md:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Shop By Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatedGradientBorder containerClassName="h-full">
              <CategoryCard
                title="Wigs"
                image="/placeholder.svg?height=400&width=300"
                link="/products/wigs"
                description="Premium human hair wigs in various styles and lengths"
              />
            </AnimatedGradientBorder>
            <AnimatedGradientBorder containerClassName="h-full">
              <CategoryCard
                title="Frontals"
                image="/placeholder.svg?height=400&width=300"
                link="/products/frontals"
                description="High-quality lace frontals for a natural hairline"
              />
            </AnimatedGradientBorder>
            <AnimatedGradientBorder containerClassName="h-full">
              <CategoryCard
                title="Wigging Tools"
                image="/placeholder.svg?height=400&width=300"
                link="/products/tools"
                description="Professional tools for wig installation and maintenance"
              />
            </AnimatedGradientBorder>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Featured Wigs</h2>
            <Link href="/products/wigs" className="text-primary flex items-center hover:underline">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredWigs.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Frontals */}
      <section className="py-12 px-4 md:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Featured Frontals</h2>
            <Link href="/products/frontals" className="text-primary flex items-center hover:underline">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredFrontals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="py-12 px-4 md:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Wigging Tools</h2>
            <Link href="/products/tools" className="text-primary flex items-center hover:underline">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredTools.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Services Banner */}
      <section className="py-12 px-4 md:px-6 lg:px-8 bg-primary text-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-6 md:mb-0">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Professional Wig Installation Services</h2>
              <p className="text-lg mb-6">
                Our experts provide professional wig installation, styling, and maintenance services to ensure your wig
                looks perfect.
              </p>
              <Button asChild variant="secondary" size="lg">
                <Link href="/services">Book an Appointment</Link>
              </Button>
            </div>
            <div className="md:w-1/2 md:pl-8">
              <AnimatedGradientBorder>
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="Wig installation service"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg"
                />
              </AnimatedGradientBorder>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 px-4 md:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TestimonialCard
              name="Amara Johnson"
              quote="The quality of the wigs is exceptional. I've received so many compliments on my new look!"
              image="/placeholder.svg?height=100&width=100"
            />
            <TestimonialCard
              name="Chioma Okafor"
              quote="The installation service was professional and the stylist really understood what I wanted."
              image="/placeholder.svg?height=100&width=100"
            />
            <TestimonialCard
              name="Blessing Adeyemi"
              quote="I love how natural the frontals look. Best purchase I've made this year!"
              image="/placeholder.svg?height=100&width=100"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function CategoryCard({
  title,
  image,
  link,
  description,
}: {
  title: string
  image: string
  link: string
  description: string
}) {
  return (
    <Link href={link} className="group h-full">
      <div className="bg-background rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg h-full">
        <div className="relative h-64">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground mb-4">{description}</p>
          <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-white">
            Shop Now
          </Button>
        </div>
      </div>
    </Link>
  )
}

function TestimonialCard({ name, quote, image }: { name: string; quote: string; image: string }) {
  return (
    <AnimatedGradientBorder>
      <div className="bg-background p-6 rounded-lg shadow h-full">
        <div className="flex items-center mb-4">
          <Image src={image || "/placeholder.svg"} alt={name} width={50} height={50} className="rounded-full mr-4" />
          <h3 className="font-semibold">{name}</h3>
        </div>
        <p className="text-muted-foreground italic">"{quote}"</p>
      </div>
    </AnimatedGradientBorder>
  )
}

