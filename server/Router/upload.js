import express from "express";
import multer from "multer";
import { loadPDFText } from "../utils/pdfLoader.js";
import { extractTextFromDOCX } from "../utils/fileExtractor.js";
import { generateEmbedding } from "../utils/embedding.js";
import { generateTestCaseDocument, triggerExecution } from "../utils/testCaseGenerator.js";
import Embedding from "../Schema/embedding.js";
import { summarizeText } from "../utils/summaryGenerator.js"; 
import { runWorkflow } from "../utils/masterSlave.js";
import { readFilesRecursive } from "../utils/codeContext.js";
import path from "path";
import {  io } from '../config/socket.js';

const TARGET_DIR = path.resolve("../pankaj/rapidops_testing/src");
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


router.post("/process-workflow", upload.single("requirements"), async (req, res) => {
  try {
    let { pathUrl } = req.body;
    const file = req.file;
    pathUrl = pathUrl || TARGET_DIR;

    console.log("📂 Reading developed code from:", pathUrl);
    io.emit("message", `📂 Reading developed code from: ${pathUrl}`);

    // Read developed code
    const developedCode = await readFilesRecursive(pathUrl);
    if (!developedCode) {
      console.log("⚠️ No developed code found at the provided path.");
      io.emit("message", "⚠️ No developed code found at the provided path.");
      return res.status(400).json({ error: "No developed code found at the provided path." });
    }

    if (!file) {
      console.log("⚠️ No file uploaded.");
      io.emit("message", "⚠️ No file uploaded.");
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log(`📄 Processing uploaded file: ${file.originalname}`);
    io.emit("message", `📄 Processing uploaded file: ${file.originalname}`);

    let extractedText = "";

    // Extract text based on file type
    if (file.mimetype === "application/pdf") {
      extractedText = await loadPDFText(file.buffer, file.originalname);
      console.log("✅ Extracted text from PDF.");
      io.emit("message", "✅ Extracted text from PDF.");
    } else if (
      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.originalname.endsWith(".docx")
    ) {
      extractedText = await extractTextFromDOCX(file.buffer);
      console.log("✅ Extracted text from DOCX.");
      io.emit("message", "✅ Extracted text from DOCX.");
    } else {
      console.log("❌ Unsupported file type.");
      io.emit("message", "❌ Unsupported file type.");
      return res.status(400).json({ error: "Unsupported file type" });
    }

    // Summarize extracted text
    console.log("📝 Summarizing extracted text...");
    io.emit("message", "📝 Summarizing extracted text...");

    const summary = await summarizeText(extractedText);

    // Run workflow with extracted text and developed code
    console.log("🔍 Running workflow...");
    io.emit("message", "🔍 Running workflow...");

    const result = await runWorkflow(summary, developedCode);

    console.log("✅ Workflow execution completed.");
    io.emit("message", "✅ Workflow execution completed.");

    res.json({
      success: Array.isArray(result.validationErrors) ? result.validationErrors.length === 0 : false,
      analysisResults: result.analysisResults || [],
      seleniumScripts: result.seleniumScripts || [],
      validationErrors: result.validationErrors || [],
      testCaseDocument: result.testCaseDocument || null
    });
    

  } catch (error) {
    console.error("❌ Error in workflow execution:", error);
    io.emit("message", `❌ Error in workflow execution: ${error.message}`);

    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

router.post("/run-workflow", upload.single("requirements"), async (req, res) => {
  try {
    let { pathUrl } = req.body;
    const file = req.file;
    pathUrl = pathUrl || TARGET_DIR; // Use the provided path or default to TARGET_DIR
    const developedCode = await readFilesRecursive(pathUrl);

    if (!file || !developedCode) {
      return res.status(400).json({ error: "Missing required fields: file, developedCode" });
    }

    console.log("\n🔍 Received API Request: Running workflow...");
    const result = await runWorkflow(file, developedCode);

    res.json({
      success: result.validationErrors.length === 0,
      analysisResults: result.analysisResults,
      seleniumScripts: result.seleniumScripts,
      validationErrors: result.validationErrors
    });
  } catch (error) {
    console.error("❌ Error in workflow execution:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});




router.post("/upload", upload.single("requirements"), async (req, res) => {
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
    
    const summary = await summarizeText(extractedText);

    // // Generate vector embedding for the combined context.
    // const embedding = await generateEmbedding(summary);

    // // Save the combined context and embedding to MongoDB.
    // const embeddingDocument = new Embedding({
    //   type: "requirements",
    //   content: summary,
    //   embedding,
    // });
    // await embeddingDocument.save();

    // Generate a test case document using LangChain and LangGraph.
    const testCaseDocument = await generateTestCaseDocument(summary , figmaJSON);
    
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




router.get("/execute", (req, res) => {
  console.log("🔵 [Server] Execution request received.");

  try {
    triggerExecution();
    res.json({ message: "Selenium test execution started." });
  } catch (error) {
    console.error("❌ [Server] Error executing test script:", error);
    res.status(500).json({ error: "Failed to execute test script." });
  }
});