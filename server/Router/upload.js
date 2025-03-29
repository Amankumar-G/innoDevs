// routes/upload.js
import express from "express";
import multer from "multer";
import { loadPDFText } from "../utils/pdfLoader.js";
import { extractTextFromDOCX } from "../utils/fileExtractor.js";
import { generateEmbedding } from "../utils/embedding.js";
import { generateTestCaseDocument } from "../utils/testCaseGenerator.js";
import Embedding from "../Schema/embedding.js";
import { summarizeText } from "../utils/summaryGenerator.js"; 

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("requirementsFile"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    let extractedText = "";
    
    // If the file is a PDF, use the LangChain PDF loader.
    if (file.mimetype === "application/pdf") {
      extractedText = await loadPDFText(file.buffer, file.originalname);
    } else if (
      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.originalname.endsWith(".docx")
    ) {
      // For DOCX, use mammoth extraction.
      extractedText = await extractTextFromDOCX(file.buffer);
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    // Get Figma JSON payload from request body.
    // const figmaJSON = req.body.figmaJSON;
    // if (!figmaJSON) {
    //   return res.status(400).json({ error: "Figma JSON payload is missing" });
    // }

    const summary = await summarizeText(extractedText);
    // Combine the extracted requirements text and Figma data.
    const combinedContext = `Requirements: ${summary}`;

    // Generate vector embedding for the combined context.
    const embedding = await generateEmbedding(summary);

    // Save the combined context and embedding to MongoDB.
    const embeddingDocument = new Embedding({
      type: "requirements",
      content: combinedContext,
      embedding,
    });
    await embeddingDocument.save();

    // Generate a test case document using LangChain and LangGraph.
    const testCaseDocument = await generateTestCaseDocument(summary);

    res.json({
      message: "File processed, embedding stored, and test case document generated.",
      testCaseDocument,
    });
  } catch (error) {
    console.error("Error in /upload:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
