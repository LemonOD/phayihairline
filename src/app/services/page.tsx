import Image from "next/image"
import Link from "next/link"
import { Check, Clock } from "lucide-react"

import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { AnimatedGradientBorder } from "@/src/components/ui-enhancements/animated-gradient-border"

export default function ServicesPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      {/* Hero Section */}
      <section className="mb-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Professional Wig Installation Services</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Our expert stylists provide professional wig installation, customization, and styling services to ensure
              your wig looks perfect and natural.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link href="#services">View Services</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Book Appointment</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <Image
              src="/placeholder.svg?height=800&width=600"
              alt="Wig installation service"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section id="services" className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Services</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We offer a range of professional services to help you get the most out of your wig investment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ServiceCard
            title="Wig Installation"
            price="₦15,000"
            description="Professional installation of your wig for a secure, comfortable, and natural-looking fit by PhayiHairline."
            duration="1.5 hours"
            features={[
              "Secure application",
              "Natural hairline blending",
              "Styling after installation",
              "Application tips and advice",
            ]}
            image="/placeholder.svg?height=400&width=600"
          />

          <ServiceCard
            title="Wig Customization"
            price="₦25,000"
            description="Customize your wig to perfectly match your style preferences and facial features at PhayiHairline."
            duration="2-3 hours"
            features={[
              "Cutting and shaping",
              "Thinning and texturizing",
              "Plucking for natural hairline",
              "Baby hair creation",
            ]}
            image="/placeholder.svg?height=400&width=600"
          />

          <ServiceCard
            title="Wig Styling"
            price="₦10,000"
            description="Professional styling of your wig to achieve your desired look by PhayiHairline."
            duration="1 hour"
            features={[
              "Curling or straightening",
              "Updos and special occasion styles",
              "Color touch-ups",
              "Heat protection treatment",
            ]}
            image="/placeholder.svg?height=400&width=600"
          />

          <ServiceCard
            title="Wig Maintenance"
            price="₦12,000"
            description="Keep your wig looking fresh and extend its lifespan with our maintenance service at PhayiHairline."
            duration="1.5 hours"
            features={["Deep cleaning", "Detangling", "Conditioning treatment", "Minor repairs"]}
            image="/placeholder.svg?height=400&width=600"
          />

          <ServiceCard
            title="Frontal Installation"
            price="₦8,000"
            description="Professional installation of lace frontals for a seamless, natural-looking hairline by PhayiHairline."
            duration="1 hour"
            features={[
              "Secure application",
              "Lace tinting if needed",
              "Hairline customization",
              "Styling after installation",
            ]}
            image="/placeholder.svg?height=400&width=600"
          />

          <ServiceCard
            title="Wig Coloring"
            price="₦20,000"
            description="Professional coloring service to transform your wig with vibrant, long-lasting color at PhayiHairline."
            duration="2-3 hours"
            features={[
              "Custom color mixing",
              "Highlights or balayage",
              "Ombre or color melting",
              "Color-safe treatment",
            ]}
            image="/placeholder.svg?height=400&width=600"
          />
        </div>
      </section>

      {/* Process Section */}
      <section className="mb-16 bg-muted/30 p-8 rounded-lg">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Process</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We follow a detailed process to ensure you get the best results with your wig installation and styling.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          <ProcessStep
            number="01"
            title="Consultation"
            description="We discuss your preferences, lifestyle, and desired look to determine the best approach."
          />
          <ProcessStep
            number="02"
            title="Preparation"
            description="We prepare your natural hair and the wig for installation, ensuring everything is clean and ready."
          />
          <ProcessStep
            number="03"
            title="Installation"
            description="Our expert stylists carefully install your wig using professional techniques for a secure fit."
          />
          <ProcessStep
            number="04"
            title="Styling"
            description="We style your wig to achieve your desired look and provide maintenance instructions."
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Find answers to common questions about our wig installation and styling services.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <FaqCard
            question="How long does a wig installation last?"
            answer="With proper care, our professional wig installations can last 2-4 weeks, depending on the method used and how you maintain it."
          />
          <FaqCard
            question="Can I wash my hair with the wig installed?"
            answer="Yes, but we recommend gentle cleansing and following our specific care instructions to maintain the installation."
          />
          <FaqCard
            question="Do I need to bring my own wig?"
            answer="Yes, our services are for installation and styling of your own wig. We also sell high-quality wigs if you need to purchase one."
          />
          <FaqCard
            question="How should I prepare for my appointment?"
            answer="Come with clean, dry hair. If you're getting a wig installed, bring your wig and any specific styling references you have."
          />
          <FaqCard
            question="Do you offer wig repair services?"
            answer="Yes, we offer minor repairs as part of our maintenance service. For extensive repairs, additional charges may apply."
          />
          <FaqCard
            question="How do I book an appointment?"
            answer="You can book an appointment through our contact page, by phone, or by visiting our store in Ikorodu, Lagos State."
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Clients Say</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Hear from our satisfied clients about their experience with our wig installation and styling services.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <TestimonialCard
            quote="The installation was flawless and so natural looking! Everyone thought it was my real hair."
            name="Chioma Okafor"
            image="/placeholder.svg?height=100&width=100"
          />
          <TestimonialCard
            quote="I love how PhayiHairline customized my wig to perfectly frame my face. The service was professional and friendly."
            name="Blessing Adeyemi"
            image="/placeholder.svg?height=100&width=100"
          />
          <TestimonialCard
            quote="The styling was exactly what I wanted, and they gave me great tips on how to maintain my wig at home."
            name="Amara Johnson"
            image="/placeholder.svg?height=100&width=100"
          />
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary text-primary-foreground p-8 md:p-12 rounded-lg text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Book Your Appointment?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Contact us today to schedule your wig installation or styling service.
        </p>
        <Button asChild variant="secondary" size="lg">
          <Link href="/contact">Book Now</Link>
        </Button>
      </section>
    </div>
  )
}

function ServiceCard({
  title,
  price,
  description,
  duration,
  features,
  image,
}: {
  title: string
  price: string
  description: string
  duration: string
  features: string[]
  image: string
}) {
  return (
    <AnimatedGradientBorder containerClassName="h-full">
      <Card className="overflow-hidden h-full">
        <div className="relative h-48">
          <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover" />
        </div>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="text-2xl font-bold">{price}</div>
            <div className="flex items-center text-muted-foreground text-sm">
              <Clock className="h-4 w-4 mr-1" />
              {duration}
            </div>
          </div>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/contact">Book Service</Link>
          </Button>
        </CardFooter>
      </Card>
    </AnimatedGradientBorder>
  )
}

function ProcessStep({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function FaqCard({ question, answer }: { question: string; answer: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{question}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{answer}</p>
      </CardContent>
    </Card>
  )
}

function TestimonialCard({ quote, name, image }: { quote: string; name: string; image: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4">
          <p className="text-muted-foreground italic">"{quote}"</p>
        </div>
        <div className="flex items-center">
          <Image src={image || "/placeholder.svg"} alt={name} width={40} height={40} className="rounded-full mr-3" />
          <div className="font-medium">{name}</div>
        </div>
      </CardContent>
    </Card>
  )
}

