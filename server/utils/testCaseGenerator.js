import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, START, END } from "@langchain/langgraph";

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
};

// Node function that generates the test case document
async function generateTestNode(state) {
  console.log("🟢 [generateTestNode] Received state:", state);

  // Updated prompt including system instructions for an expert QA Lead
  const prompt = `Act as an expert QA Lead.
*Your Task:* Generate a structured functional test plan document based on the application details provided below. Focus on creating actionable test scenarios and detailed test cases.

*User: Provide Application Details Below:*

*   *Context:* [App Name/Type, Core Purpose, Target Audience]
*   *Functional Requirements:* [Bulleted list]
*   *UI Components:* [Bulleted list of key screens/elements]
*   *Business Rules:* [Bulleted list]

*Required Test Plan Output:*

1.  *Scope:*
    *   In-Scope: Features derived from Functional Requirements.
    *   Out-of-Scope: (e.g., Performance, Security - unless specified).

2.  *Test Scenarios:*
    *   High-level scenarios covering major features/flows.
    *   Format: TS_XXX: [Scenario Description]

3.  *Detailed Test Cases:*
    *   Generate specific test cases for each scenario.
    *   *Must Include for each case:*
        *   Test Case ID: (Unique)
        *   Scenario ID: (Links to TS_XXX)
        *   Test Case Title: (Concise)
        *   Prerequisites: (Setup needed)
        *   Test Steps: (Numbered, clear actions)
        *   Test Data: (Specific inputs)
        *   Expected Result: (Observable outcome based on requirements/rules)

4.  *Edge & Error Cases:*
    *   Generate specific test cases (using the same detailed format) covering:
        *   Boundary values
        *   Invalid inputs / Error handling
        *   Empty/Null inputs

*Formatting:*

*   Use Markdown for clear structure (headings, lists).
*   Ensure traceability from requirements to scenarios and cases.
*   Base output directly on the provided details.

${state.context}`;

  console.log("🟡 [generateTestNode] Sending prompt to LLM...");
  
  const response = await llm.invoke([
    { role: "system", content: "You are a test case generator." },
    { role: "user", content: prompt },
  ]);

  console.log("✅ [generateTestNode] LLM response received.");

  // Return updated state with test document
  return { testDocument: response.content };
}

// Build a graph with a single node
const graphBuilder = new StateGraph({
  channels: {
    context: {
      value: (_prev, next) => next,
      default: () => "",
    },
    testDocument: {
      value: (_prev, next) => next,
      default: () => "",
    },
  },
})
  .addNode("generateTest", generateTestNode)
  .addEdge(START, "generateTest")
  .addEdge("generateTest", END);

console.log("🔵 [Graph] StateGraph initialized and compiled.");

// Compile the graph
const compiledGraph = graphBuilder.compile();

// Function to generate test case document
export async function generateTestCaseDocument(context) {
  console.log("🟡 [generateTestCaseDocument] Invoked with context:", context);

  // Run the graph
  const result = await compiledGraph.invoke({ context });

  console.log("✅ [generateTestCaseDocument] Test document generated successfully.");

  // Return the generated test document
  return result.testDocument;
}
