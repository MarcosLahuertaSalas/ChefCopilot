export interface EventDish {
  id: string
  name: string
  category: string
}

export interface EventDietaryRequirement {
  id: string
  requirementName: string
  guestCount: number
  replacedDishId?: string | null
  replacedDishName?: string | null
  substituteDishId?: string | null
  substituteDishName?: string | null
  notes?: string | null
}

export interface CreateEventDietaryRequirementRequest {
  requirementName: string
  guestCount: number
  replacedDishId?: string | null
  substituteDishId?: string | null
  notes?: string | null
}

export interface DishPortionBreakdown {
  dishId: string
  dishName: string
  category: string
  isMenuDish: boolean
  standardPortions: number
  substitutedOutPortions: number
  specialPortions: number
  totalPortionsToCook: number
  specialRequirementNotes: string[]
}

export interface Event {
  id: string
  name: string
  eventDate: string
  standardGuests: number
  menuDishes: EventDish[]
  dietaryRequirements?: EventDietaryRequirement[]
}

export interface CreateEventRequest {
  name: string
  eventDate: string
  standardGuests: number
  dishIds: string[]
  dietaryRequirements?: CreateEventDietaryRequirementRequest[]
}

export interface UpdateEventRequest {
  id: string
  name: string
  eventDate: string
  standardGuests: number
  dishIds: string[]
  dietaryRequirements?: CreateEventDietaryRequirementRequest[]
}

export interface ShoppingListItem {
  ingredientId: string
  ingredientName: string
  unitOfMeasure: string
  totalNetQuantity: number
  wastePercentage: number
  reusableWastePercentage: number
  totalWastePercentage: number
  totalGrossQuantityRequired: number
  currentStock: number
  minimumStock: number
  quantityToBuy: number
  projectedStockAfterEvent: number
  isLowStockAlert: boolean
  lowStockMessage?: string | null
  estimatedReusableQuantity: number
  estimatedNetTrashQuantity: number
  isPurchasedByPiece: boolean
  minPortionsPerPiece?: number | null
  maxPortionsPerPiece?: number | null
  totalPortionsRequired: number
  piecesToBuy?: number | null
  estimatedMinPortionsYield?: number | null
  estimatedMaxPortionsYield?: number | null
  estimatedSurplusPortions?: number | null
  defaultProvider: string
  allergens: string[]
  isVegetarian: boolean
  isVegan: boolean
  usedInDishes: string[]
}

export interface EventShoppingList {
  eventId: string
  eventName: string
  eventDate: string
  guests: number
  standardGuests: number
  dietaryGuests: number
  totalDishes: number
  totalStockAlerts: number
  totalEstimatedReusableTrimmings: number
  dietaryRequirements: EventDietaryRequirement[]
  dishBreakdown: DishPortionBreakdown[]
  items: ShoppingListItem[]
}
