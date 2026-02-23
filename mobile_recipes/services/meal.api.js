const BASE_URL = "https://www.themealdb.com/api/json/v1/1"

export const MealAPI = {
  searchByName: async (query) => { 
    try {
      const response = await fetch(`${BASE_URL}/search.php?s=${encodeURIComponent(query)}`)
      const data = await response.json()
      return data.meals || []
    } catch (error) {
      console.error("Error searching meals by name:", error)
      return []
    }
  },

  getById: async (id) => { 
    try {
      const response = await fetch(`${BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`)
      const data = await response.json()
      return data.meals ? data.meals[0] : null
    } catch (error) {
      console.error("Error fetching meal by ID:", error)
      return null
    }
  },

  getRandom: async () => { 
    try {
      const response = await fetch(`${BASE_URL}/random.php`)
      const data = await response.json()
      return data.meals ? data.meals[0] : null
    } catch (error) {
      console.error("Error fetching random meal:", error)
      return null
    }
  },

  getRandoms: async (count = 6) => { 
    try {
      const promises = Array(count).fill().map(() => MealAPI.getRandom())
      const meals = await Promise.all(promises)

      return meals.filter(meal => meal !== null)
    } catch (error) {
      console.log("Error fetching random meals:", error)
      return []
    }
  },

  getCategories: async () => { 
    try {
      const response = await fetch(`${BASE_URL}/categories.php`)
      const data = await response.json()
      return data.categories || []
    } catch (error) {
      console.error("Error fetching categories:", error)
      return []
    }
  },

  filterByIngredient: async (ingredient) => { 
    try {
      const response = await fetch(`${BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`)
      const data = await response.json()
      return data.meals || []
    } catch (error) {
      console.error("Error filtering meals by ingredient:", error)
      return []
    }
  },

  filterByCategory: async (category) => { 
    try {
      const response = await fetch(`${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`)
      const data = await response.json()
      return data.meals || []
    } catch (error) {
      console.error("Error filtering meals by category:", error)
      return []
    }
  },

  transformDataMeal: (meal) => { 
    if (!meal) return null

    const ingredients = []
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`]
      const measure = meal[`strMeasure${i}`]
      if (ingredient && ingredient.trim()) { 
        const measureText = measure && measure.trim() ? `${measure.trim()}` : ""
        ingredients.push(`${measureText}${ingredient.trim()}`)
      }
    }

    const instructions = meal.strInstructions ? meal.strInstructions.split(/\r?\n/).filter((step) => step.trim()) : []

    return {
      id: meal.idMeal,
      title: meal.strMeal,
      description: meal.strInstructions ? meal.strInstructions.substring(0, 100) + "..." : "Delicious meal from TheMealDB",
      image: meal.strMealThumb,
      cookTime: "30 minutes",
      servings: 4,
      category: meal.strCategory || "General",
      area: meal.strArea,
      instructions,
      ingredients,
      originalData: meal,
    }
  }

}