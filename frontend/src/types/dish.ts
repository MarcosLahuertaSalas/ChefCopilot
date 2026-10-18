export interface DishIngredient {
  ingredientId: string
  ingredientName: string
  quantity: number
}

export interface Dish {
  id: string
  name: string
  description: string
  category: string
  ingredients: DishIngredient[]
}

export interface CreateDishIngredientDto {
  ingredientId: string
  quantity: number
}

export interface CreateDishRequest {
  name: string
  description: string
  category: string
  ingredients: CreateDishIngredientDto[]
}

export interface UpdateDishRequest {
  id: string
  name: string
  description: string
  category: string
  ingredients: CreateDishIngredientDto[]
}
