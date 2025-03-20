"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Filter, X } from "lucide-react"

import { Button } from "@/src/components/ui/button"
import { Checkbox } from "@/src/components/ui/checkbox"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/src/components/ui/sheet"
import ProductCard from "@/src/components/product-card"
import { featuredWigs, featuredFrontals, featuredTools } from "@/src/lib/products"
import type { Product } from "@/src/lib/types"
import { useFilter } from "@/src/lib/context/filter-context"

export default function CategoryPage({ params }: { params: { category: string } }) {
  const { category } = params
  const { filters, updatePriceRange, updateHairType, updateSortBy } = useFilter()

  // State for mobile filter drawer
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // State for filtered products
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])

  // Validate category and get products
  let categoryTitle = ""
  let categoryDescription = ""

  useEffect(() => {
    let products: Product[]

    switch (category) {
      case "wigs":
        products = featuredWigs
        categoryTitle = "Wigs"
        categoryDescription = "Premium quality human hair wigs in various styles and lengths."
        break
      case "frontals":
        products = featuredFrontals
        categoryTitle = "Frontals"
        categoryDescription = "High-quality lace frontals for a natural hairline."
        break
      case "tools":
        products = featuredTools
        categoryTitle = "Wigging Tools"
        categoryDescription = "Professional tools for wig installation and maintenance."
        break
      default:
        // This will be handled by notFound() below
        products = []
    }

    setAllProducts(products)
  }, [category])

  // Apply filters whenever filters or products change
  useEffect(() => {
    if (allProducts.length === 0) return

    let result = [...allProducts]

    // Apply price range filter
    if (filters.priceRange.length > 0) {
      result = result.filter((product) => {
        if (filters.priceRange.includes("under-10000") && product.price < 10000) return true
        if (filters.priceRange.includes("10000-30000") && product.price >= 10000 && product.price <= 30000) return true
        if (filters.priceRange.includes("30000-50000") && product.price > 30000 && product.price <= 50000) return true
        return filters.priceRange.includes("over-50000") && product.price > 50000;

      })
    }

    // Apply hair type filter (only for wigs category)
    if (category === "wigs" && filters.hairType.length > 0) {
      result = result.filter((product) => {
        // This is a simplified example. In a real app, you would have a hairType property on your products
        const productName = product.name.toLowerCase()
        if (filters.hairType.includes("straight") && productName.includes("straight")) return true
        if (filters.hairType.includes("body-wave") && productName.includes("body wave")) return true
        if (filters.hairType.includes("curly") && productName.includes("curly")) return true
        if (filters.hairType.includes("kinky") && productName.includes("kinky")) return true
        return filters.hairType.length === 0 // If no hair types selected, include all
      })
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "price-low":
          result.sort((a, b) => a.price - b.price)
          break
        case "price-high":
          result.sort((a, b) => b.price - a.price)
          break
        case "newest":
          // In a real app, you would sort by date
          // Here we're just keeping the original order
          break
        default: // 'featured'
          // Keep original order
          break
      }
    }

    setFilteredProducts(result)
  }, [allProducts, filters, category])

  // Handle filter changes
  const handlePriceChange = (value: string) => {
    const currentPrices = [...filters.priceRange]
    const index = currentPrices.indexOf(value)

    if (index === -1) {
      updatePriceRange([...currentPrices, value])
    } else {
      currentPrices.splice(index, 1)
      updatePriceRange(currentPrices)
    }
  }

  const handleHairTypeChange = (value: string) => {
    const currentTypes = [...filters.hairType]
    const index = currentTypes.indexOf(value)

    if (index === -1) {
      updateHairType([...currentTypes, value])
    } else {
      currentTypes.splice(index, 1)
      updateHairType(currentTypes)
    }
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSortBy(e.target.value)
  }

  // If category is invalid, show 404
  if (!["wigs", "frontals", "tools"].includes(category)) {
    return notFound()
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
        <span className="text-foreground font-medium">{categoryTitle}</span>
      </div>

      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{categoryTitle}</h1>
        <p className="text-muted-foreground">{categoryDescription}</p>
      </div>

      {/* Filter and Sort (Mobile) */}
      <div className="flex md:hidden items-center justify-between mb-6">
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3">Price Range</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox
                      id="mobile-price-1"
                      checked={filters.priceRange.includes("under-10000")}
                      onCheckedChange={() => handlePriceChange("under-10000")}
                      className="mr-2"
                    />
                    <label htmlFor="mobile-price-1" className="text-sm">
                      Under ₦10,000
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="mobile-price-2"
                      checked={filters.priceRange.includes("10000-30000")}
                      onCheckedChange={() => handlePriceChange("10000-30000")}
                      className="mr-2"
                    />
                    <label htmlFor="mobile-price-2" className="text-sm">
                      ₦10,000 - ₦30,000
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="mobile-price-3"
                      checked={filters.priceRange.includes("30000-50000")}
                      onCheckedChange={() => handlePriceChange("30000-50000")}
                      className="mr-2"
                    />
                    <label htmlFor="mobile-price-3" className="text-sm">
                      ₦30,000 - ₦50,000
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="mobile-price-4"
                      checked={filters.priceRange.includes("over-50000")}
                      onCheckedChange={() => handlePriceChange("over-50000")}
                      className="mr-2"
                    />
                    <label htmlFor="mobile-price-4" className="text-sm">
                      Over ₦50,000
                    </label>
                  </div>
                </div>
              </div>

              {category === "wigs" && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3">Hair Type</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Checkbox
                        id="mobile-type-1"
                        checked={filters.hairType.includes("straight")}
                        onCheckedChange={() => handleHairTypeChange("straight")}
                        className="mr-2"
                      />
                      <label htmlFor="mobile-type-1" className="text-sm">
                        Straight
                      </label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="mobile-type-2"
                        checked={filters.hairType.includes("body-wave")}
                        onCheckedChange={() => handleHairTypeChange("body-wave")}
                        className="mr-2"
                      />
                      <label htmlFor="mobile-type-2" className="text-sm">
                        Body Wave
                      </label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="mobile-type-3"
                        checked={filters.hairType.includes("curly")}
                        onCheckedChange={() => handleHairTypeChange("curly")}
                        className="mr-2"
                      />
                      <label htmlFor="mobile-type-3" className="text-sm">
                        Curly
                      </label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox
                        id="mobile-type-4"
                        checked={filters.hairType.includes("kinky")}
                        onCheckedChange={() => handleHairTypeChange("kinky")}
                        className="mr-2"
                      />
                      <label htmlFor="mobile-type-4" className="text-sm">
                        Kinky
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <Button className="w-full" onClick={() => setIsFilterOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <select
          className="bg-background border rounded-md px-3 py-1 text-sm"
          value={filters.sortBy}
          onChange={handleSortChange}
        >
          <option value="featured">Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {/* Desktop Layout with Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Filters (Desktop) */}
        <div className="hidden md:block">
          <div className="bg-background p-6 rounded-lg border">
            <h3 className="font-semibold mb-4">Filters</h3>

            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">Price Range</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Checkbox
                    id="price-1"
                    checked={filters.priceRange.includes("under-10000")}
                    onCheckedChange={() => handlePriceChange("under-10000")}
                    className="mr-2"
                  />
                  <label htmlFor="price-1" className="text-sm">
                    Under ₦10,000
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox
                    id="price-2"
                    checked={filters.priceRange.includes("10000-30000")}
                    onCheckedChange={() => handlePriceChange("10000-30000")}
                    className="mr-2"
                  />
                  <label htmlFor="price-2" className="text-sm">
                    ₦10,000 - ₦30,000
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox
                    id="price-3"
                    checked={filters.priceRange.includes("30000-50000")}
                    onCheckedChange={() => handlePriceChange("30000-50000")}
                    className="mr-2"
                  />
                  <label htmlFor="price-3" className="text-sm">
                    ₦30,000 - ₦50,000
                  </label>
                </div>
                <div className="flex items-center">
                  <Checkbox
                    id="price-4"
                    checked={filters.priceRange.includes("over-50000")}
                    onCheckedChange={() => handlePriceChange("over-50000")}
                    className="mr-2"
                  />
                  <label htmlFor="price-4" className="text-sm">
                    Over ₦50,000
                  </label>
                </div>
              </div>
            </div>

            {category === "wigs" && (
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3">Hair Type</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox
                      id="type-1"
                      checked={filters.hairType.includes("straight")}
                      onCheckedChange={() => handleHairTypeChange("straight")}
                      className="mr-2"
                    />
                    <label htmlFor="type-1" className="text-sm">
                      Straight
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="type-2"
                      checked={filters.hairType.includes("body-wave")}
                      onCheckedChange={() => handleHairTypeChange("body-wave")}
                      className="mr-2"
                    />
                    <label htmlFor="type-2" className="text-sm">
                      Body Wave
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="type-3"
                      checked={filters.hairType.includes("curly")}
                      onCheckedChange={() => handleHairTypeChange("curly")}
                      className="mr-2"
                    />
                    <label htmlFor="type-3" className="text-sm">
                      Curly
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="type-4"
                      checked={filters.hairType.includes("kinky")}
                      onCheckedChange={() => handleHairTypeChange("kinky")}
                      className="mr-2"
                    />
                    <label htmlFor="type-4" className="text-sm">
                      Kinky
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">Sort By</h4>
              <select
                className="w-full bg-background border rounded-md px-3 py-2 text-sm"
                value={filters.sortBy}
                onChange={handleSortChange}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            {/* Active filters */}
            {(filters.priceRange.length > 0 || filters.hairType.length > 0) && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Active Filters</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                    onClick={() => {
                      updatePriceRange([])
                      updateHairType([])
                    }}
                  >
                    Clear all
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.priceRange.map((price) => (
                    <div key={price} className="flex items-center bg-muted px-2 py-1 rounded-full text-xs">
                      {price === "under-10000" && "Under ₦10,000"}
                      {price === "10000-30000" && "₦10,000 - ₦30,000"}
                      {price === "30000-50000" && "₦30,000 - ₦50,000"}
                      {price === "over-50000" && "Over ₦50,000"}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 p-0"
                        onClick={() => handlePriceChange(price)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {filters.hairType.map((type) => (
                    <div key={type} className="flex items-center bg-muted px-2 py-1 rounded-full text-xs">
                      {type === "straight" && "Straight"}
                      {type === "body-wave" && "Body Wave"}
                      {type === "curly" && "Curly"}
                      {type === "kinky" && "Kinky"}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 p-0"
                        onClick={() => handleHairTypeChange(type)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="md:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your filters or check back later.</p>
              <Button asChild variant="outline">
                <Link href="/public">Back to Home</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

