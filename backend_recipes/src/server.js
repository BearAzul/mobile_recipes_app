import express from "express"
import { ENV } from "./config/env.js"
import cors from "cors"
import { notFound, errorHandler } from "./middlewares/error.middleware.js"
import favoritesRoute from "./routes/favorites.route.js"
import job from "./config/cron.js"

const PORT = ENV.PORT || 5001

const app = express()

job.start()

app.use(express.json())
app.use(cors())

app.use("/api/v2/favorites", favoritesRoute)
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running in http://localhost:${PORT}/`)
})