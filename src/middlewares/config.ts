import dotenv from "dotenv";
dotenv.config();

export const MODERATION_METHOD = process.env.MODERATION || "google-vision";
