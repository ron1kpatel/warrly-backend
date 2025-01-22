import mongoose from "mongoose";
import config from  "../config/config.js"
import { DB_NAME } from "../constants.js"

const connectDB = async () => {
    try {
        const connectionString = `${config.MONGODB_URI}${config.MONGODB_URI.endsWith("/")?"":"/"}${DB_NAME}`;

        const connectionInstance = await mongoose.connect(
            connectionString, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }
        );

        console.log(`Database connected!
        DB Host: ${connectionInstance.connection.host}
        DB: ${connectionInstance.connection.db.databaseName}`);
    } catch(error) {
        console.log("Database connection failed: ", error.message);
        process.exit(1);
    }
}

export default connectDB;