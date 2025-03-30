import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, START, END } from "@langchain/langgraph";
import fs from "fs";
import { spawn } from "child_process";
import {generateSeleniumTestPrompt,generateTestPrompt} from "./prompts.js"

// Read the API key from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const llm = new ChatOpenAI({
  openAIApiKey: OPENAI_API_KEY,
  model: "gpt-4o-mini", // Corrected model name
  temperature: 0,
});

// Define a simple state structure
const initialState = {
  context: "", // initial context (to be populated)
  figmaJSON: "", // Figma design details in JSON format
};

// Node function that generates the test case document
async function generateTestNode(state) {
  console.log("🟢 [generateTestNode] Received state:", state);

  // Updated prompt including system instructions for an expert QA Lead
  const prompt = generateTestPrompt(state.context);

  console.log("🟡 [generateTestNode] Sending prompt to LLM...");

  const response = await llm.invoke([
    { role: "system", content: "You are a test case generator." },
    { role: "user", content: prompt },
  ]);

  console.log("✅ [generateTestNode] LLM response received.");

  // Return updated state with test document
  return { ...state, testDocument: response.content };
}

// Node function that generates Selenium test cases script using testDocument and figmaJSON
async function generateSeleniumTestNode(state) {
  console.log("🟢 [generateSeleniumTestNode] Received state:", state);
  const { testDocument, figmaJSON , url} = state;

  // Construct prompt for generating Selenium test cases script
  const prompt = generateSeleniumTestPrompt(testDocument, figmaJSON, url);


  console.log("🟡 [generateSeleniumTestNode] Sending prompt to LLM...");

  const response = await llm.invoke([
    { role: "system", content: "You are a QA automation script generator." },
    { role: "user", content: prompt },
  ]);

  console.log("✅ [generateSeleniumTestNode] LLM response received.");

  const scriptContent = response.content.replace(/^javascript\s*/, '').replace(/```$/, '');

  const filePath = "./seleniumTestCases.js";

  // Write the Selenium test cases script to a file using Node.js file system
  fs.writeFileSync(filePath, scriptContent);
  console.log("📝 [generateSeleniumTestNode] Selenium test cases script written to:", filePath);

  // Return updated state with selenium test script content if needed downstream
  return { ...state, seleniumTestScript: scriptContent };
}

// Build a graph with two nodes: one for generating the test document, and another for generating the Selenium script
const graphBuilder = new StateGraph({
  channels: {
    context: {
      value: (_prev, next) => next,
      default: () => "",
    },
    figmaJSON: {
      value: (_prev, next) => next,
      default: () => "",
    },
    testDocument: {
      value: (_prev, next) => next,
      default: () => "",
    },
    seleniumTestScript: {
      value: (_prev, next) => next,
      default: () => "",
    },
  },
})
  .addNode("generateTest", generateTestNode)
  .addNode("generateSeleniumTest", generateSeleniumTestNode)
  .addEdge(START, "generateTest")
  .addEdge("generateTest", "generateSeleniumTest")
  .addEdge("generateSeleniumTest", END);

console.log("🔵 [Graph] StateGraph initialized and compiled.");

// Compile the graph
const compiledGraph = graphBuilder.compile();

/**
 * Function to generate both test case document and Selenium test script.
 * @param {string} context - The application details context.
 * @param {string} figmaJSON - The Figma design details in JSON format.
 * @returns {Promise<string>} - The generated Selenium test script.
 */
export async function generateTestCaseDocument(context, figmaJSON) {
  console.log("🟡 [generateTestCaseDocument] Invoked with context:", context);
  console.log("🟡 [generateTestCaseDocument] Invoked with figmaJSON:", figmaJSON);

  // Run the graph with the provided context and figmaJSON
  const result = await compiledGraph.invoke({ context, figmaJSON });

  console.log("✅ [generateTestCaseDocument] Selenium test script generated successfully.");

  // Return the generated Selenium test script
  return result.testDocument;
}

export function triggerExecution() {
  const filePath = "./seleniumTestCases.mjs";

  if (!fs.existsSync(filePath)) {
    console.error("❌ [triggerExecution] No Selenium test script found.");
    return;
  }

  console.log("🚀 [triggerExecution] Running Selenium test script...");

  // Spawn a new Node process
  const process = spawn("node", [filePath], { stdio: "inherit" });

  process.on("error", (err) => {
    console.error(`❌ [triggerExecution] Execution error: ${err.message}`);
  });

  process.on("exit", (code) => {
    console.log(`✅ [triggerExecution] Process exited with code ${code}`);
  });
}