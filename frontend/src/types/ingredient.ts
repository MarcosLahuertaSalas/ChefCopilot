export interface Ingredient {
  id: string
  name: string
  unitOfMeasure: string
  wastePercentage: number
  reusableWastePercentage: number
  currentStock: number
  minimumStock: number
  isPurchasedByPiece: boolean
  minPortionsPerPiece?: number | null
  maxPortionsPerPiece?: number | null
  defaultProvider: string
  allergens: string[]
  isVegetarian: boolean
  isVegan: boolean
}

export interface CreateIngredientRequest {
  name: string
  unitOfMeasure: string
  wastePercentage: number
  reusableWastePercentage?: number
  currentStock?: number
  minimumStock?: number
  isPurchasedByPiece?: boolean
  minPortionsPerPiece?: number | null
  maxPortionsPerPiece?: number | null
  defaultProvider?: string
  allergens?: string[]
  isVegetarian?: boolean
  isVegan?: boolean
}

export interface UpdateIngredientRequest {
  id: string
  name: string
  unitOfMeasure: string
  wastePercentage: number
  reusableWastePercentage?: number
  currentStock?: number
  minimumStock?: number
  isPurchasedByPiece?: boolean
  minPortionsPerPiece?: number | null
  maxPortionsPerPiece?: number | null
  defaultProvider?: string
  allergens?: string[]
  isVegetarian?: boolean
  isVegan?: boolean
}
