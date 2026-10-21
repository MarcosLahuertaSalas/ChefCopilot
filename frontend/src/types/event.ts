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
  status: 'Planned' | 'Completed'
  completedAt?: string | null
  postMortemNotes?: string | null
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

// Tipos para el Post-Mortem Culinario
export interface EventPostMortemItem {
  id: string
  ingredientId: string
  ingredientName: string
  unitOfMeasure: string
  plannedGrossQuantity: number
  plannedWastePercentage: number
  plannedWasteQuantity: number
  plannedReusablePercentage: number
  plannedReusableQuantity: number
  actualWasteQuantity: number
  actualReusableQuantity: number
  actualWastePercentage: number
  actualReusablePercentage: number
  wasteDeviationPercentage: number
  appliedToPantry: boolean
  notes?: string | null
}

export interface CloseEventPostMortemItemRequest {
  ingredientId: string
  actualWasteQuantity: number
  actualReusableQuantity: number
  applyToPantry: boolean
  notes?: string | null
}

export interface CloseEventRequest {
  eventId: string
  postMortemNotes?: string | null
  items: CloseEventPostMortemItemRequest[]
}

export interface EventPostMortemReport {
  eventId: string
  eventName: string
  eventDate: string
  status: 'Planned' | 'Completed'
  completedAt?: string | null
  postMortemNotes?: string | null
  totalPlannedWasteQuantity: number
  totalActualWasteQuantity: number
  totalPlannedReusableQuantity: number
  totalActualReusableQuantity: number
  overallEfficiencyPercentage: number
  items: EventPostMortemItem[]
}
