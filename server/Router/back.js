import express from "express";
import multer from "multer";
import { loadPDFText } from "../utils/pdfLoader.js";
import { extractTextFromDOCX } from "../utils/fileExtractor.js";
import { generateEmbedding } from "../utils/embedding.js";
import { generateTestCaseDocument, triggerExecution } from "../utils/testCaseGenerator.js";
import Embedding from "../Schema/embedding.js";
import { summarizeText } from "../utils/summaryGenerator.js"; 
import { runWorkflow } from "../utils/backMaster-Slave.js";
import path from "path";
import {  io } from '../config/socket.js';
import fs from "fs"; // Using promise-base 
import { exec } from "child_process";
import { promisify } from "util";

import { fileURLToPath } from "url";

const execPromise = promisify(exec); // Convert exec to promise-based

// Helper to get the directory of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function readFilesRecursive(dir) {
  let allContent = "";

  function readDirectory(currentPath) {
    if (path.basename(currentPath) === "node_modules") return; // Skip node_modules

    const files = fs.readdirSync(currentPath);

    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        readDirectory(filePath); // Recursively read subdirectory
      } else if (/\.(jsx|js|html|css)$/i.test(file)) {
        // Only process .jsx, .js, .html, .css files
        const content = fs.readFileSync(filePath, "utf-8");
        allContent += `\n\n### ${filePath} ###\n${content}`;
      }
    }
  }

  readDirectory(dir);
  return allContent;
}

const TARGET_DIR = path.resolve("../test-server");
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
let scripts = []; // Array to store the generated scripts

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

    // // Summarize extracted text
    // console.log("📝 Summarizing extracted text...");
    // io.emit("message", "📝 Summarizing extracted text...");

    // const summary = await summarizeText(extractedText);

    // Run workflow with extracted text and developed code
    console.log("🔍 Running workflow...");
    io.emit("message", "🔍 Running workflow...");

    const result = await runWorkflow(extractedText, developedCode);

    console.log("✅ Workflow execution completed.");
    io.emit("message", "✅ Workflow execution completed.");
    console.log("--------------------------------------------------------------------");
    const scripts = result.seleniumScripts?.map(item => item.script) || []; // Store the generated scripts in the global array
    console.log("Result:", scripts);
    console.log("--------------------------------------------------------------------");  
    res.json({
      analysisResults: result.analysisResults || [],
      // seleniumScripts: result.seleniumScripts || [],
      validationErrors: result.validationErrors || [],
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





router.get("/execute", async (req, res) => {
  console.log("🔵 [Server] Execution request received.");

  try {
    for (let i = 0; i < scripts.length; i++) {
      const scriptContent = scripts[i].replace(/^```javascript\n/, "").replace(/\n```$/, "");
      const scriptPath = path.join(__dirname, `script_${i + 1}.js`);

      // Write script content to a file
      await fs.writeFile(scriptPath, scriptContent);
      console.log(`✅ [Server] Script ${i + 1} saved: ${scriptPath}`);

      // Execute the script and log output
      try {
        const { stdout, stderr } = await execPromise(`node ${scriptPath}`);
        console.log(`📜 [Output of script ${i + 1}]:\n${stdout}`);
        if (stderr) console.error(`⚠️ [Server] Script ${i + 1} stderr:\n${stderr}`);
      } catch (error) {
        console.error(`❌ [Server] Error executing script ${i + 1}:`, error);
      }

      // Remove the script file after execution
      await fs.unlink(scriptPath);
      console.log(`🗑️ [Server] Script ${i + 1} deleted`);
    }

    res.json({ message: "Selenium test execution completed." });
  } catch (error) {
    console.error("❌ [Server] Error executing test scripts:", error);
    res.status(500).json({ error: "Failed to execute test scripts." });
  }
});

export default router;