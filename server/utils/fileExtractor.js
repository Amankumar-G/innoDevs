// utils/fileExtractor.js
import mammoth from "mammoth";

export async function extractTextFromDOCX(buffer) {
  try {
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  } catch (error) {
    console.error("Error parsing DOCX:", error);
    throw error;
  }
}
