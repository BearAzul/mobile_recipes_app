import cron from "cron"
import https from "https"
import dotenv from "dotenv"

dotenv.config()

const job = new cron.CronJob("*/14 * * * *", function () { 
  https.get(process.env.API_URL, (res) => {
    if(res.statusCode === 200) {
      console.log("API is up and running")
    } else {
      console.error(`API is down. Status code: ${res.statusCode}`)
    }
  }).on("error", (err) => {
    console.error(`Error checking API: ${err.message}`)
  })
})

export default job