import { View, Text, Alert, ScrollView, TouchableOpacity, FlatList } from 'react-native'
import { useClerk, useUser } from "@clerk/clerk-expo"
import { useState, useEffect } from "react"
import { API_URL } from '../../services/favorites.api.js'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'
import { favoritesStyles } from '../../assets/styles/favorites.styles.js'
import { searchStyles } from "../../assets/styles/search.styles.js"
import { Ionicons } from "@expo/vector-icons"
import { COLORS } from '../../constants/colors.js'
import RecipeCard from '../../components/RecipeCard.jsx'
import { useRouter } from "expo-router"

const FavoritesScreen = () => {
  const { signOut } = useClerk()
  const { user } = useUser()
  const router = useRouter()

  const [favorites, setFavorites] = useState()
  const [loading, setLoading] = useState()

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch(`${API_URL}/favorites/${user.id}`)
        if (!response.ok) throw new Error("Failed to fetching favorites recipes")

        const favorites = await response.json()

        const resultsFavorites = favorites.map((favorite) => ({
          ...favorite,
          id: favorite.recipe_id
        }))

        setFavorites(resultsFavorites)
      } catch (error) {
        console.log("Error to Load Favorite Recipes: ", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [user.id])

  const handleSignOut = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: signOut }
    ])
  }

  if (loading) return <LoadingSpinner message="Loading Favorites..." />

  return (
    <View style={favoritesStyles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        <View style={favoritesStyles.header}>
          <Text style={favoritesStyles.title}>Favorites</Text>

          <TouchableOpacity style={favoritesStyles.logoutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={favoritesStyles.recipesSection}>
          <FlatList
            data={favorites}
            renderItem={({ item }) => <RecipeCard recipe={item} />}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={favoritesStyles.row}
            contentContainerStyle={favoritesStyles.recipesGrid}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={favoritesStyles.emptyState}>
                <Ionicons name='heart-dislike-outline' size={48} color={COLORS.textLight} />
                <Text style={searchStyles.emptyTitle}>No favorite recipes yet</Text>
                <Text style={[searchStyles.emptyDescription, { marginBottom: 10 }]}>
                  Try to add the recipe as a favorite or check your internet connection.
                </Text>

                <TouchableOpacity style={favoritesStyles.exploreButton} onPress={() => router.push("/search")}>
                  <Ionicons name='search' size={18} color={COLORS.white} />
                  <Text style={favoritesStyles.exploreButtonText}>Explore Recipes</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>

      </ScrollView>
    </View>
  )
}

export default FavoritesScreen