import dotenv from "dotenv";

dotenv.load();

export const MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/test";
export const SITES_COLLECTION = process.env.SENSORS_COLLECTION || "sites";
