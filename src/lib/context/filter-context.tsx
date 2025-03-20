"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface FilterState {
  priceRange: string[]
  hairType: string[]
  sortBy: string
}

interface FilterContextType {
  filters: FilterState
  updatePriceRange: (values: string[]) => void
  updateHairType: (values: string[]) => void
  updateSortBy: (value: string) => void
  clearFilters: () => void
}

const defaultFilters: FilterState = {
  priceRange: [],
  hairType: [],
  sortBy: "featured",
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters)

  const updatePriceRange = (values: string[]) => {
    setFilters((prev) => ({ ...prev, priceRange: values }))
  }

  const updateHairType = (values: string[]) => {
    setFilters((prev) => ({ ...prev, hairType: values }))
  }

  const updateSortBy = (value: string) => {
    setFilters((prev) => ({ ...prev, sortBy: value }))
  }

  const clearFilters = () => {
    setFilters(defaultFilters)
  }

  return (
    <FilterContext.Provider
      value={{
        filters,
        updatePriceRange,
        updateHairType,
        updateSortBy,
        clearFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  )
}

export function useFilter() {
  const context = useContext(FilterContext)
  if (context === undefined) {
    throw new Error("useFilter must be used within a FilterProvider")
  }
  return context
}

