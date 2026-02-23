import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native'
import { useEffect, useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce.js';
import { MealAPI } from '../../services/meal.api.js';
import { searchStyles } from "../../assets/styles/search.styles.js"
import { Ionicons } from "@expo/vector-icons"
import { COLORS } from '../../constants/colors.js';
import RecipeCard from '../../components/RecipeCard.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const debounceSearchQuery = useDebounce(searchQuery, 300)

  const paramsSearch = async (query) => {
    if (!query.trim()) {
      const randomMeals = await MealAPI.getRandoms(10)
      return randomMeals.map((meal) => MealAPI.transformDataMeal(meal)).filter((meal) => meal !== null)
    }

    const searchResults = await MealAPI.searchByName(query)
    let results = searchResults

    if (results.length === 0) {
      const ingredientResults = await MealAPI.filterByIngredient(query)
      results = ingredientResults
    }

    return results.slice(0, 10).map((meal) => MealAPI.transformDataMeal(meal)).filter((meal) => meal !== null)
  }

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const results = await paramsSearch("")
        setRecipes(results)
      } catch (error) {
        console.error("Error loading initial data:", error)
      } finally {
        setInitialLoading(false)
      }
    }

    loadInitialData()
  }, [])

  useEffect(() => {
    if (initialLoading) return

    const handleSearch = async () => {
      setLoading(true)
      try {
        const results = await paramsSearch(debounceSearchQuery)
        setRecipes(results)
      } catch (error) {
        console.error("Error searching meals:", error)
        setRecipes([])
      } finally {
        setLoading(false)
      }
    }

    handleSearch()
  }, [debounceSearchQuery, initialLoading])


  if (initialLoading) return <LoadingSpinner message="Loading recipes..." />


  return (
    <View style={searchStyles.container}>
      <View style={searchStyles.searchSection}>
        <View style={[searchStyles.searchContainer, { marginTop: 20 }]}>
          <Ionicons name='search' color={COLORS.primary} size={20} style={searchStyles.searchIcon} />
          <TextInput
            style={searchStyles.searchInput}
            placeholder='Search recipes, ingredients...'
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType='search'
          />

          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={searchStyles.clearButton}>
              <Ionicons name='close-circle' color={COLORS.textLight} size={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={searchStyles.resultsSection}>
        <View style={searchStyles.resultsHeader}>
          <Text style={searchStyles.resultsTitle}>
            {searchQuery ? `Results for "${searchQuery}"` : "Popular Recipes"}
          </Text>
          <Text style={searchStyles.resultsCount}>{recipes.length} found</Text>
        </View>

        {loading ? (
          <View style={searchStyles.loadingContainer}>
            <LoadingSpinner message="Searching recipes..." size="small" />
          </View>
        ) : (
          <FlatList
            data={recipes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <RecipeCard recipe={item} />}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={searchStyles.row}
            contentContainerStyle={searchStyles.resultsGrid}
            ListEmptyComponent={
              <View style={searchStyles.emptyState}>
                <Ionicons name='cloud-offline-outline' size={48} color={COLORS.textLight} />
                <Text style={searchStyles.emptyTitle}>No recipes available</Text>
                <Text style={searchStyles.emptyDescription}>
                  Try searching with different keywords or check your internet connection.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  )
}

export default SearchScreen