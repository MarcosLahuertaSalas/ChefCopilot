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
  totalGrossQuantityToBuy: number
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
  items: ShoppingListItem[]
}
