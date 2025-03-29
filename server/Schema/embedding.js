// models/embedding.js
import mongoose from "mongoose";

const embeddingSchema = new mongoose.Schema({
  type: { type: String, enum: ["requirements", "figma"], required: true },
  content: { type: String, required: true },
  embedding: { type: [Number], required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Embedding", embeddingSchema);
