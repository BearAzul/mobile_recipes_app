import express from "express"
import { ENV } from "./config/env.js"
import cors from "cors"
import favoritesRoute from "./routes/favorites.route.js"
import job from "./config/cron.js"

const PORT = ENV.PORT || 5001

const app = express()

if (ENV.NODE_ENV === "production") job.start()

app.use(express.json())
app.use(cors())

app.use("/api/v2/favorites", favoritesRoute)

app.listen(PORT, () => {
  console.log(`Server is running in http://localhost:${PORT}/`)
})