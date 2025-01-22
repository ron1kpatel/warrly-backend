import app from "./app.js";
import config from "./config/config.js";
import connectDB from "./db/index.js";

connectDB().then(() => {
    app.listen(config.PORT, () => {
        console.log(`Server is running on ${config.HOST_URL}:${config.PORT}`)
    })
}).catch((err) => {
    console.error("Database connection failure, ERROR: ",err);
})