export interface EventDish {
  id: string
  name: string
  category: string
}

export interface Event {
  id: string
  name: string
  eventDate: string
  standardGuests: number
  menuDishes: EventDish[]
}

export interface CreateEventRequest {
  name: string
  eventDate: string
  standardGuests: number
  dishIds: string[]
}

export interface UpdateEventRequest {
  id: string
  name: string
  eventDate: string
  standardGuests: number
  dishIds: string[]
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
  totalDishes: number
  totalStockAlerts: number
  totalEstimatedReusableTrimmings: number
  items: ShoppingListItem[]
}
