// utils/embedding.js
import { OpenAIEmbeddings } from "@langchain/openai";

export async function generateEmbedding(text) {
  try {

    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large"
    });
    console.log(text);
    const response = await embeddings.embedQuery(text);
    console.log(response);
    return response;
  } catch (error) {
    console.error("Error generating embedding:", error.response.data);
    throw error;
  }
}
