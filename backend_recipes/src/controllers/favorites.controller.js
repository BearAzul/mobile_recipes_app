import { db } from "../config/db.js";
import { favorites } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

export const getFavorites = async (req, res) => { 
  try {
    const { user_id } = req.params;

    const favoritesList = await db.select().from(favorites).where(eq(favorites.user_id, user_id));
    
    res.status(200).json(favoritesList);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Something went wrong while fetching favorites" });
  }
}

export const createFavorite = async (req, res) => { 
    try {
      const { user_id, recipe_id, image, title, cookTime, servings } = req.body;

      if (!user_id || !recipe_id || !title) { 
        return res.status(400).json({ error: "Missing required fields" });
      }

      const newFavorite = await db.insert(favorites).values({
        user_id,
        recipe_id,
        image,
        title,
        cookTime,
        servings
      }).returning();

      res.status(201).json(newFavorite);
    } catch (error) {
      console.error("Error creating favorite:", error);
      res.status(500).json({ error: "Something went wrong while creating the favorite" });
    }
}

export const deleteFavorite = async (req, res) => { 
  try {
    const { user_id, recipe_id } = req.params;

    const deletedFavorite = await db.delete(favorites)
      .where(and(eq(favorites.user_id, user_id), eq(favorites.recipe_id, parseInt(recipe_id))))
      .returning();

    if (deletedFavorite.length === 0) {
      return res.status(404).json({ error: "Favorite not found" });
    }

    res.status(200).json({ message: "Favorite deleted successfully", deletedFavorite });
  } catch (error) {
    console.error("Error deleting favorite:", error);
    res.status(500).json({ error: "Something went wrong while deleting the favorite" });
  }
}