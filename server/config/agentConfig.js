// config.js
import { Configuration, OpenAIApi } from "openai";
import dotenv from 'dotenv';
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Replace with your actual API key

export const openaiConfig = new Configuration({ apiKey: OPENAI_API_KEY });
export const openai = new OpenAIApi(openaiConfig);

export const MONGO_URI = process.env.DB;
