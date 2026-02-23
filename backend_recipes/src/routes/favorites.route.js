import {
  getFavorites,
  createFavorite,
  deleteFavorite,
} from "../controllers/favorites.controller.js";
import express from "express";

const router = express.Router();

router.get("/:user_id", getFavorites);
router.post("/", createFavorite);
router.delete("/:user_id/:recipe_id", deleteFavorite);

export default router;
