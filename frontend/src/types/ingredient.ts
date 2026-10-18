export interface Ingredient {
  id: string
  name: string
  unitOfMeasure: string
  wastePercentage: number
  defaultProvider: string
  allergens: string[]
  isVegetarian: boolean
  isVegan: boolean
}

export interface CreateIngredientRequest {
  name: string
  unitOfMeasure: string
  wastePercentage: number
  isVegetarian?: boolean
  isVegan?: boolean
}

export interface UpdateIngredientRequest {
  id: string
  name: string
  unitOfMeasure: string
  wastePercentage: number
  defaultProvider?: string
  isVegetarian?: boolean
  isVegan?: boolean
}
