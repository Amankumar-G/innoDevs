import { StateGraph, END } from "@langchain/langgraph";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { masterNodePrompt, firstLevelWorkerPrompt, secondLevelWorkerPrompt } from "./promptBackTemplate.js";
import { io } from '../config/socket.js';

// Initialize LLM instances with different roles
const masterLLM = new ChatOpenAI({ modelName: "gpt-4o-mini", temperature: 0 });
const componentLLM = new ChatOpenAI({ modelName: "gpt-4o-mini", temperature: 0 });
const backendLLM = new ChatOpenAI({ modelName: "gpt-4o-mini", temperature: 0 }); // second layer for backend test cases

/**
 * Master Service Analysis Node - Identifies services from SRS and code
 * Input: { srsDocument: string, developedCode: string }
 * Output: { services: Array<{name, srsDetails, codeFragment}> }
 */
async function masterServiceAnalyzer(state) {
  console.log("\n=== MASTER SERVICE ANALYSIS STARTED ===");
  io.emit("message", "\n=== MASTER SERVICE ANALYSIS STARTED ===");
  console.log("Input received:", {
    srsDocLength: state.srsDocument?.length,
    codeLength: state.developedCode?.length
  });
  io.emit("message", `Input received: SRS doc length: ${state.srsDocument?.length}, Code length: ${state.developedCode?.length}`);

  // Create and execute the analysis prompt for services.
  const prompt = masterNodePrompt; // Ensure masterNodePrompt is adapted to output services instead of components

  const chain = prompt.pipe(masterLLM);
  const response = await chain.invoke(state);
  // Expected JSON: { services: [{ name, srsDetails, codeFragment }] }
  const services = JSON.parse(
    response.content.replace(/^javascript\s*/, '').replace(/```$/, '')
  ).services;

  console.log("Identified services:", services.map(s => s.name));
  io.emit("message", `Identified services: ${services.map(s => s.name).join(', ')}`);
  console.log("=== MASTER SERVICE ANALYSIS COMPLETED ===\n");
  io.emit("message", "=== MASTER SERVICE ANALYSIS COMPLETED ===");
  return { services };
}

/**
 * Service Analysis Tool - Validates individual services
 * Input: { name: string, srsDetails: string, codeFragment: string }
 * Output: { meetsRequirements: boolean, details: string, testCases: string[] }
 */
const serviceAnalyzer = async (service) => {
  console.log(`\nAnalyzing service: ${service.name}`);
  io.emit("message", `\nAnalyzing service: ${service.name}`);
  console.log("Service details:", {
    srsDetailsLength: service.srsDetails?.length,
    codeFragmentLength: service.codeFragment?.length
  });
  io.emit("message", `Service details: SRS details length: ${service.srsDetails?.length}, Code fragment length: ${service.codeFragment?.length}`);

  // Create and execute service validation prompt
  const prompt = firstLevelWorkerPrompt; // Ensure this prompt is adjusted to check service requirements

  const chain = prompt.pipe(componentLLM);
  const response = await chain.invoke({
    name: service.name,
    srsDetails: service.srsDetails,
    codeFragment: service.codeFragment
  });
  const result = JSON.parse(
    response.content
      .replace(/^json\s*/i, '')
      .replace(/```/g, '')
      .trim()
  );
  console.log(`Analysis result for ${service.name}:`, 
    result.meetsRequirements ? "VALID" : "INVALID");
  io.emit("message", `Analysis result for ${service.name}: ${result.meetsRequirements ? "VALID" : "INVALID"}`);
  return result;
};

/**
 * API Documentation Generator - Creates API docs for the service
 * Input: { serviceName: string, codeFragment: string }
 * Output: string (generated API documentation)
 */
const apiDocGenerator = async (serviceName, codeFragment) => {
  console.log(`\nGenerating API documentation for: ${serviceName}`);
  io.emit("message", `\nGenerating API documentation for: ${serviceName}`);
  // For API docs generation, you can use the masterLLM (or a dedicated prompt)
  // Here we assume that masterNodePrompt is adapted for API doc generation.
  const prompt = ChatPromptTemplate.fromTemplate(
    `Based on the following code fragment for the service "${serviceName}", generate clear and concise API documentation:\n\n${codeFragment}\n\nAPI Documentation:`
  );
  const chain = prompt.pipe(masterLLM);
  const response = await chain.invoke({ serviceName, codeFragment });
  console.log(`API documentation generated for ${serviceName}`);
  io.emit("message", `API documentation generated for ${serviceName}`);
  return response.content;
};

/**
 * Backend Test Generator - Creates backend test scripts based on API docs and test cases
 * Input: { serviceName: string, apiDocs: string, testCases: string[] }
 * Output: string (generated backend test script)
 */
const backendTestGenerator = async (serviceName, apiDocs, testCases, url) => {
  console.log(`\nGenerating backend tests for: ${serviceName}`);
  io.emit("message", `\nGenerating backend tests for: ${serviceName}`);
  console.log("Test cases received:", testCases);
  io.emit("message", `Test cases received: ${JSON.stringify(testCases)}`);

  // Create and execute backend test generation prompt
  // secondLevelWorkerPrompt should be adjusted to work for backend test case generation based on API docs.
  const prompt = secondLevelWorkerPrompt;
  const chain = prompt.pipe(backendLLM);
  const response = await chain.invoke({
    serviceName: serviceName,
    apiDocs: apiDocs,
    testCases: testCases,
    url
  });

  console.log(`Backend tests generated for ${serviceName}`);
  io.emit("message", `Backend tests generated for ${serviceName}`);
  return response.content;
};

async function runWorkflow(srsDocument, developedCode) {
  const url = "http://localhost:3000";
  // Create state graph with initial values
  const workflow = new StateGraph({
    channels: {
      srsDocument: {
        default: () => srsDocument,
        aggregate: "last"
      },
      developedCode: {
        default: () => developedCode,
        aggregate: "last"
      },
      services: {
        default: () => [],
        aggregate: "last"
      },
      analysisResults: {
        default: () => [],
        aggregate: "last"
      },
      backendTestScripts: {
        default: () => [],
        aggregate: "last"
      },
      validationErrors: {
        default: () => [],
        aggregate: "last"
      }
    }
  });
  
  // Define workflow nodes with logging
  workflow.addNode("master_service_analysis", masterServiceAnalyzer);

  workflow.addNode("service_analysis", async (state) => {
    console.log("\n=== SERVICE ANALYSIS PHASE STARTED ===");
    io.emit("message", "\n=== SERVICE ANALYSIS PHASE STARTED ===");
    console.log(`Processing ${state.services.length} services`);
    io.emit("message", `Processing ${state.services.length} services`);
    
    const results = [];
    for (const service of state.services) {
      console.log(`\nProcessing service: ${service.name}`);
      io.emit("message", `\nProcessing service: ${service.name}`);
      const analysis = await serviceAnalyzer(service);
      results.push({ service: service.name, codeFragment: service.codeFragment, ...analysis });
    }

    console.log("Service analysis results:", results);
    io.emit("message", `Service analysis results: ${JSON.stringify(results)}`);
    console.log("=== SERVICE ANALYSIS PHASE COMPLETED ===\n");
    io.emit("message", "=== SERVICE ANALYSIS PHASE COMPLETED ===");
    return { ...state, analysisResults: results };
  });

  workflow.addNode("generate_backend_tests", async (state) => {
    console.log("\n=== BACKEND TEST GENERATION STARTED ===");
    io.emit("message", "\n=== BACKEND TEST GENERATION STARTED ===");
    const validServices = state.analysisResults.filter(r => r.meetsRequirements);
    console.log(`Generating tests for ${validServices.length} valid services`);
    io.emit("message", `Generating tests for ${validServices.length} valid services`);

    const scripts = [];
    for (const result of validServices) {
      console.log(`\nProcessing valid service: ${result.service}`);
      io.emit("message", `\nProcessing valid service: ${result.service}`);
      // Generate API documentation first
      const apiDocs = await apiDocGenerator(result.service, result.codeFragment);
      // Then generate backend tests based on API docs and provided test cases
      const script = await backendTestGenerator(result.service, apiDocs, result.testCases, url);
      scripts.push({ service: result.service, script, testCases: result.testCases });
    }

    console.log(`Generated ${scripts.length} backend test scripts`);
    io.emit("message", `Generated ${scripts.length} backend test scripts`);
    console.log("=== BACKEND TEST GENERATION COMPLETED ===\n");
    io.emit("message", "=== BACKEND TEST GENERATION COMPLETED ===");
    return { ...state, backendTestScripts: scripts };
  });

  workflow.addNode("handle_errors", (state) => {
    console.log("\n=== ERROR HANDLING PHASE ===");
    io.emit("message", "\n=== ERROR HANDLING PHASE ===");
    const errors = state.analysisResults
      .filter(r => !r.meetsRequirements)
      .map(r => ({
        service: r.service,
        issues: r.details,
        requiredActions: "Review SRS requirements and code implementation"
      }));

    console.log(`Found ${errors.length} services with issues`);
    io.emit("message", `Found ${errors.length} services with issues`);
    console.log("Services with errors:", errors.map(e => e.service));
    io.emit("message", `Services with errors: ${errors.map(e => e.service).join(', ')}`);
    return { ...state, validationErrors: errors };
  });

  // Define workflow transitions
  workflow.addEdge("master_service_analysis", "service_analysis");

  workflow.addConditionalEdges(
    "service_analysis",
    (state) => {
      const hasValidServices = state.analysisResults.some(r => r.meetsRequirements);
      console.log(`\nValidation check: ${hasValidServices ? "SOME VALID SERVICES" : "ALL FAILED"}`);
      io.emit("message", `\nValidation check: ${hasValidServices ? "SOME VALID SERVICES" : "ALL FAILED"}`);
  
      return hasValidServices ? "generate_backend_tests" : "handle_errors";
    },
    { generate_backend_tests: "generate_backend_tests", handle_errors: "handle_errors" }
  );
  
  workflow.addEdge("generate_backend_tests", END);
  workflow.addEdge("handle_errors", END);

  workflow.setEntryPoint("master_service_analysis");

  // Compile and execute workflow
  const app = workflow.compile();

  console.log("\n=== WORKFLOW EXECUTION START ===");
  io.emit("message", "\n=== WORKFLOW EXECUTION START ===");
  const executionResult = await app.invoke({
    srsDocument: srsDocument,
    developedCode: developedCode
  });

  console.log("\n=== FINAL RESULTS ===");
  io.emit("message", "\n=== FINAL RESULTS ===");
  
  if (executionResult && executionResult.validationErrors) {
    console.log("Validation success:", executionResult.validationErrors.length === 0);
    io.emit("message", `Validation success: ${executionResult.validationErrors.length === 0}`);
  } else {
    console.log("Validation success: N/A (executionResult undefined)");
    io.emit("message", "Validation success: N/A (executionResult undefined)");
  }
  
  if (executionResult && executionResult.backendTestScripts) {
    console.log("Generated scripts:", executionResult.backendTestScripts.map(s => s.service));
    io.emit("message", `Generated scripts: ${executionResult.backendTestScripts.map(s => s.service).join(', ')}`);
  } else {
    console.log("Generated scripts: N/A");
    io.emit("message", "Generated scripts: N/A");
  }
  
  if (executionResult && executionResult.validationErrors) {
    console.log("Errors detected:", executionResult.validationErrors);
    io.emit("message", `Errors detected: ${JSON.stringify(executionResult.validationErrors)}`);
  } else {
    console.log("Errors detected: N/A");
    io.emit("message", "Errors detected: N/A");
  }
  
  console.log("=== WORKFLOW EXECUTION COMPLETE ===\n");
  io.emit("message", "=== WORKFLOW EXECUTION COMPLETE ===");
  
  return executionResult;
}

export { runWorkflow };
