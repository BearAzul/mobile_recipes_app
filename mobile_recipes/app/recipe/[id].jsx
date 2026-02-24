import { View, Text, Alert, ScrollView, TouchableOpacity } from 'react-native'
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from 'react'
import { useUser } from "@clerk/clerk-expo"
import { API_URL } from '../../services/favorites.api.js'
import { MealAPI } from "../../services/meal.api.js"
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import { recipeDetailStyles } from "../../assets/styles/detail.styles.js"
import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { COLORS } from '../../constants/colors.js'
import { WebView } from "react-native-webview"

const RecipeDetailScreen = () => {
  const { id: recipe_id } = useLocalSearchParams()
  const router = useRouter()

  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { user } = useUser()

  const user_id = user?.id

  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        const response = await fetch(`${API_URL}/favorites/${user_id}`)
        const favorites = await response.json()

        const isRecipeSaved = favorites.some((favorite) => favorite.recipe_id === parseInt(recipe_id))

        setIsSaved(isRecipeSaved)
      } catch (error) {
        console.log("Error checking if recipe is saved: ", error)
      }
    }

    const fetchRecipeDetail = async () => {
      setLoading(true)
      try {
        const mealDetail = await MealAPI.getById(recipe_id)
        if (mealDetail) {
          const resultsRecipeDetail = MealAPI.transformDataMeal(mealDetail)

          const recipeWithVideo = {
            ...resultsRecipeDetail,
            youtubeUrl: mealDetail.strYoutube || null
          }

          setRecipe(recipeWithVideo)
        }
      } catch (error) {
        console.error("Error to fetch recipe detail: ", error)
      } finally {
        setLoading(false)
      }
    }

    checkIfSaved()
    fetchRecipeDetail()
  }, [recipe_id, user_id])

  const getYoutubeVideo = (url) => {
    const video_id = url.split("v=")[1]
    return `https://www.youtube.com/embed/${video_id}`
  }

  const handleToSaved = async () => {
    setIsSaving(true)
    try {
      if (isSaved) {
        const response = await fetch(`${API_URL}/favorites/${user_id}/${recipe_id}`, {
          method: "DELETE"
        })

        if (!response.ok) throw new Error("Failed to remove recipe from favorites")

        setIsSaved(false)
      } else {
        const response = await fetch(`${API_URL}/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            user_id,
            recipe_id: parseInt(recipe_id),
            title: recipe.title,
            image: recipe.image,
            cookTime: recipe.cookTime,
            servings: recipe.servings
          })
        })

        if (!response.ok) throw new Error("Failed to save recipe")

        setIsSaved(true)
      }
    } catch (error) {
      console.error("Error button save recipe: ", error)
      Alert.alert("Error", "Error button save, please try again!")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) return <LoadingSpinner message='loading recipe detail...' />

  return (
    <View style={recipeDetailStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={recipeDetailStyles.headerContainer}>
          <View style={recipeDetailStyles.imageContainer}>
            <Image
              source={{ uri: recipe.image }}
              style={recipeDetailStyles.headerImage}
              contentFit='cover'
            />
          </View>

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.8)"]}
            style={recipeDetailStyles.gradientOverlay}
          />

          <View style={recipeDetailStyles.floatingButtons}>
            <TouchableOpacity style={recipeDetailStyles.floatingButton} onPress={() => router.back()}>
              <Ionicons name='arrow-back' size={24} color={COLORS.white} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[recipeDetailStyles.floatingButton, { backgroundColor: isSaving ? COLORS.gray : COLORS.primary }]}
              onPress={handleToSaved}
              disabled={isSaving}
            >
              <Ionicons
                name={isSaving ? "hourglass" : isSaved ? "heart" : "heart-outline"}
                size={24}
                color={COLORS.white}
              />
            </TouchableOpacity>
          </View>

          <View style={recipeDetailStyles.titleSection}>
            <View style={recipeDetailStyles.categoryBadge}>
              <Text style={recipeDetailStyles.categoryText}>{recipe.category}</Text>
            </View>
            <Text style={recipeDetailStyles.recipeTitle}>{recipe.title}</Text>
            {recipe.area && (
              <View style={recipeDetailStyles.locationRow}>
                <Ionicons name="location-outline" size={16} color={COLORS.white} />
                <Text style={recipeDetailStyles.locationText}>{recipe.area} Cuisine</Text>
              </View>
            )}
          </View>
        </View>
        <View style={recipeDetailStyles.contentSection}>
          <View style={recipeDetailStyles.statsContainer}>
            <View style={recipeDetailStyles.statCard}>
              <LinearGradient
                colors={["#ff6b6b", "#ff8e53"]}
                style={recipeDetailStyles.statIconContainer}
              >
                <Ionicons name='time' size={20} color={COLORS.white} />
              </LinearGradient>
              <Text style={recipeDetailStyles.statValue}>{recipe.cookTime}</Text>
              <Text style={recipeDetailStyles.statLabel}>Prep Time</Text>
            </View>
            <View style={recipeDetailStyles.statCard}>
              <LinearGradient
                colors={["#4ecdc4", "#44a08d"]}
                style={recipeDetailStyles.statIconContainer}
              >
                <Ionicons name='people' size={20} color={COLORS.white} />
              </LinearGradient>
              <Text style={recipeDetailStyles.statValue}>{recipe.servings}</Text>
              <Text style={recipeDetailStyles.statLabel}>Servings</Text>
            </View>
          </View>

          {recipe.youtubeUrl && (
            <View style={recipeDetailStyles.sectionContainer}>
              <View style={recipeDetailStyles.sectionTitleRow}>
                <LinearGradient
                  colors={["#ff0000", "#cc0000"]}
                  style={recipeDetailStyles.sectionIcon}
                >
                  <Ionicons name="play" size={16} color={COLORS.white} />
                </LinearGradient>
                <Text style={recipeDetailStyles.sectionTitle}>Video Tutorial</Text>
              </View>
              <View style={recipeDetailStyles.videoCard}>
                <WebView
                  style={recipeDetailStyles.webview}
                  source={{ uri: getYoutubeVideo(recipe.youtubeUrl) }}
                  allowsFullscreenVideo
                  mediaPlaybackRequiresUserAction={false}
                />
              </View>
            </View>
          )}

          <View style={recipeDetailStyles.sectionContainer}>
            <View style={recipeDetailStyles.sectionTitleRow}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primary + "80"]}
                style={recipeDetailStyles.sectionIcon}
              >
                <Ionicons name="list" size={16} color={COLORS.white} />
              </LinearGradient>
              <Text style={recipeDetailStyles.sectionTitle}>Ingredients</Text>
              <View style={recipeDetailStyles.countBadge}>
                <Text style={recipeDetailStyles.countText}>{recipe.ingredients.length}</Text>
              </View>
            </View>

            <View style={recipeDetailStyles.ingredientsGrid}>
              {recipe.ingredients.map((ingredient, index) => (
                <View style={recipeDetailStyles.ingredientCard} key={index}>
                  <View style={recipeDetailStyles.ingredientNumber}>
                    <Text style={recipeDetailStyles.ingredientNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={recipeDetailStyles.ingredientText}>{ingredient}</Text>
                  <View style={recipeDetailStyles.ingredientCheck}>
                    <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.textLight} />
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={recipeDetailStyles.sectionContainer}>
            <View style={recipeDetailStyles.sectionTitleRow}>
              <LinearGradient
                colors={["#313647", "#435663"]}
                style={recipeDetailStyles.sectionIcon}
              >
                <Ionicons name="book" size={16} color={COLORS.white} />
              </LinearGradient>
              <Text style={recipeDetailStyles.sectionTitle}>Instructions</Text>
              <View style={recipeDetailStyles.countBadge}>
                <Text style={recipeDetailStyles.countText}>{recipe.instructions.length}</Text>
              </View>
            </View>

            <View style={recipeDetailStyles.instructionsContainer}>
              {recipe.instructions.map((instruction, index) => (
                <View style={recipeDetailStyles.instructionCard} key={index}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primary + "cc"]}
                    style={recipeDetailStyles.stepIndicator}
                  >
                    <Text style={recipeDetailStyles.stepNumber}>{index + 1}</Text>
                  </LinearGradient>
                  <View style={recipeDetailStyles.instructionContent}>
                    <Text style={recipeDetailStyles.instructionText}>{instruction}</Text>
                    <View style={recipeDetailStyles.instructionFooter}>
                      <Text style={recipeDetailStyles.stepLabel}>Step {index + 1}</Text>
                      <TouchableOpacity style={recipeDetailStyles.completeButton}>
                        <Ionicons name='checkmark' size={16} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={recipeDetailStyles.primaryButton}
            onPress={handleToSaved}
            disabled={isSaving}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primary + "cc"]}
              style={recipeDetailStyles.buttonGradient}
            >
              <Ionicons name="heart" size={20} color={COLORS.white} />
              <Text style={recipeDetailStyles.buttonText}>
                {isSaved ? "Remove from Favorites" : "Add to Favorites"}
              </Text>
            </LinearGradient>

          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  )
}

export default RecipeDetailScreen