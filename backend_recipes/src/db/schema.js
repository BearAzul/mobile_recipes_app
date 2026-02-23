import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").notNull(),
  recipe_id: integer("recipe_id").notNull(),
  image: text("image"),
  title: text("title").notNull(),
  cookTime: text("cook_time"),
  servings: text("servings"),
  created_at: timestamp("created_at").defaultNow()
});
