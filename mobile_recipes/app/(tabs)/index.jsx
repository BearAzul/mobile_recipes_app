import { View, Text, ScrollView, TouchableOpacity, FlatList, RefreshControl } from 'react-native'
import { COLORS } from "../../constants/colors.js";
import { useRouter } from "expo-router"
import { useState } from 'react';
import { MealAPI } from '../../services/meal.api.js';
import { useEffect } from 'react';
import { homeStyles } from "../../assets/styles/home.styles.js"
import { Image } from 'expo-image';
import { Ionicons } from "@expo/vector-icons"
import CategoryFilter from '../../components/CategoryFilter.jsx';
import RecipeCard from '../../components/RecipeCard.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

// const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const HomeScreen = () => {
  const router = useRouter()

  const [recipes, setRecipes] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [categories, setCategories] = useState([])
  const [featuredRecipe, setFeaturedRecipe] = useState(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchRecipes = async () => {
    setLoading(true)
    try {
      const [resCategories, resRandomMeals, resFeaturedMeals] = await Promise.all([
        MealAPI.getCategories(),
        MealAPI.getRandoms(10),
        MealAPI.getRandom()
      ])

      const getCategories = resCategories.map((category, index) => ({
        id: index + 1,
        name: category.strCategory,
        image: category.strCategoryThumb,
        description: category.strCategoryDescription,
      }))

      setCategories(getCategories)

      const getMeals = resRandomMeals.map((meal) => MealAPI.transformDataMeal(meal)).filter((meal) => meal !== null)

      setRecipes(getMeals)

      const getFeaturedMeal = MealAPI.transformDataMeal(resFeaturedMeals)
      setFeaturedRecipe(getFeaturedMeal)

    } catch (error) {
      console.error("Error fetching recipes:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategoryData = async (category) => {
    try {
      const meals = await MealAPI.filterByCategory(category)
      const transformedMeals = meals.map((meal) => MealAPI.transformDataMeal(meal)).filter((meal) => meal !== null)
      setRecipes(transformedMeals)
    } catch (error) {
      console.error("Error fetching category data:", error)
      setRecipes([])
    }
  }

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category)
    await fetchCategoryData(category)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    // await sleep(2000)
    await fetchRecipes()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchRecipes()
  }, [])

  if(loading && !refreshing) return <LoadingSpinner message='Loading Home Screen...' />

  return (
    <View style={homeStyles.container}>
      <ScrollView
        contentContainerStyle={homeStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {featuredRecipe && (
          <View style={[homeStyles.featuredSection, { marginTop: 30 }]}>
            <TouchableOpacity
              style={homeStyles.featuredCard}
              onPress={() => router.push(`/recipe/${featuredRecipe.id}`)}
              activeOpacity={.9}
            >
              <View style={homeStyles.featuredImageContainer}>
                <Image
                  source={{ uri: featuredRecipe.image }}
                  style={homeStyles.featuredImage}
                  contentFit='cover'
                  transition={500}
                />

                <View style={homeStyles.featuredOverlay}>
                  <View style={homeStyles.featuredBadge}>
                    <Text style={homeStyles.featuredBadgeText}>Featured</Text>
                  </View>

                  <View style={homeStyles.featuredContent}>
                    <Text style={homeStyles.featuredTitle} numberOfLines={2}>
                      {featuredRecipe.title}
                    </Text>

                    <View style={homeStyles.featuredMeta}>
                      <View style={homeStyles.metaItem}>
                        <Ionicons name="time-outline" size={16} color={COLORS.white} />
                        <Text style={homeStyles.metaText}>{featuredRecipe.cookTime}</Text>
                      </View>
                      <View style={homeStyles.metaItem}>
                        <Ionicons name="people-outline" size={16} color={COLORS.white} />
                        <Text style={homeStyles.metaText}>{featuredRecipe.servings}</Text>
                      </View>

                      {featuredRecipe.area && (
                        <View style={homeStyles.metaItem}>
                          <Ionicons name="location-outline" size={16} color={COLORS.white} />
                          <Text style={homeStyles.metaText}>{featuredRecipe.area}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {categories.length > 0 && (
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        )}

        <View style={homeStyles.recipesSection}>
          <View style={homeStyles.sectionHeader}>
            <Text style={homeStyles.sectionTitle}>{selectedCategory || "All Recipes"}</Text>
          </View>

          <FlatList
            data={recipes}
            renderItem={({ item }) => <RecipeCard recipe={item} />}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={homeStyles.row}
            contentContainerStyle={homeStyles.recipesGrid}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={homeStyles.emptyState}>
                <Ionicons name='cloud-offline-outline' size={48} color={COLORS.textLight} />
                <Text style={homeStyles.emptyTitle}>No recipes available</Text>
                <Text style={homeStyles.emptyDescription}>Try selecting a different category or refresh the page.</Text>
              </View>
            }
          />
        </View>
      </ScrollView>
    </View>
  )
}

export default HomeScreen