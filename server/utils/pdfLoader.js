// utils/pdfLoader.js
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import fs from "fs/promises";
import path from "path";
import os from "os";

export async function loadPDFText(buffer, originalname) {
  // Write the uploaded PDF to a temporary file.
  const tempDir = os.tmpdir();
  const filePath = path.join(tempDir, originalname);
  await fs.writeFile(filePath, buffer);
  
  // Initialize the PDFLoader. We set splitPages: false to treat the file as one document.
  const loader = new PDFLoader(filePath, { splitPages: false });
  const docs = await loader.load();
  
  // Combine text from all loaded documents (usually one document if splitPages is false).
  const combinedText = docs.map(doc => doc.pageContent).join("\n");
  
  // Clean up: remove the temporary file.
  await fs.unlink(filePath);
  
  return combinedText;
}
