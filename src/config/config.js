import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const result = dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

// Check if the .env file was successfully loaded
if (result.error) {
  console.error('⚠️  Error: Could not load .env file. Please make sure it exists.');
  process.exit(1); // Exit the application
} else {
  console.log('✅ .env file loaded successfully.');
}

// Export configuration
const config = {
  PORT: process.env.PORT || 8000,
  HOST_URL: process.env.HOST_URL || 'http://localhost',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  // Database
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_PASSWORD: process.env.MONGODB_PASSWORD,

  // Tokens
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || '1d',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || '10d',

  // Cloudinary
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    API_KEY: process.env.CLOUDINARY_API_KEY,
    API_SECRET: process.env.CLOUDINARY_API_SECRET,
  },

  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Google API
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
};



export default config;