  import { StateGraph, END } from "@langchain/langgraph";
  import { ChatPromptTemplate } from "@langchain/core/prompts";
  import { ChatOpenAI } from "@langchain/openai";
  import { masterNodePrompt ,firstLevelWorkerPrompt,secondLevelWorkerPrompt} from "./promptTemplate.js";
  import {  io } from '../config/socket.js';
  // Initialize LLM instances with different roles
  const masterLLM = new ChatOpenAI({ modelName: "gpt-4o-mini", temperature: 0 });
  const componentLLM = new ChatOpenAI({ modelName: "gpt-4o-mini", temperature: 0 });
  const seleniumLLM = new ChatOpenAI({ modelName: "gpt-4o-mini", temperature: 0 });

  /**
   * Master Analysis Node - Identifies components from SRS and code
   * Input: { srsDocument: string, developedCode: string }
   * Output: { components: Array<{name, srsDetails, codeFragment}> }
   */
  async function masterAnalyzer(state) {
    console.log("\n=== MASTER ANALYSIS STARTED ===");
    io.emit("message", "\n=== MASTER ANALYSIS STARTED ===");
    console.log("Input received:", {
      srsDocLength: state.srsDocument?.length,
      codeLength: state.developedCode?.length
    });
    io.emit("message", `Input received: SRS doc length: ${state.srsDocument?.length}, Code length: ${state.developedCode?.length}`);

    // Create and execute the analysis prompt
    const prompt = masterNodePrompt;

    const chain = prompt.pipe(masterLLM);
    const response = await chain.invoke(state);
    // console.log(response.content)
    const components = JSON.parse(response.content.replace(/^json\s*/, '').replace(/```$/, ''));

    // console.log(`-----------------------------------------------------`)
    // console.log(components);
    // console.log(`-----------------------------------------------------`)

    console.log("Identified components:", components.map(c => c.name));
    io.emit("message", `Identified components: ${components.map(c => c.name).join(', ')}`);
    console.log("=== MASTER ANALYSIS COMPLETED ===\n");
    io.emit("message", "=== MASTER ANALYSIS COMPLETED ===");
    return { components };
  }

  /**
   * Component Analysis Tool - Validates individual components
   * Input: { name: string, srsDetails: string, codeFragment: string }
   * Output: { meetsRequirements: boolean, details: string, testCases: string[] }
   */
  const componentAnalyzer = async (component) => {
    console.log(`\nAnalyzing component: ${component.name}`);
    io.emit("message", `\nAnalyzing component: ${component.name}`);
    console.log("Component details:", {
      srsDetailsLength: component.srsDetails?.length,
      codeFragmentLength: component.codeFragment?.length,
      dependencies : component.dependencies.map(c => c.dependencyName).join(', ')
    });
    io.emit("message", `Component details: SRS details length: ${component.srsDetails?.length}, Code fragment length: ${component.codeFragment?.length}`);

    // Create and execute component validation prompt
    const prompt = firstLevelWorkerPrompt

    const chain = prompt.pipe(componentLLM);
    const response = await chain.invoke({
      name: component.name,
      srsDetails: component.srsDetails,
      codeFragment: component.codeFragment,
      dependencies: component.dependencies.map(c => c.dependencyName).join(', ')
    });
    const result = JSON.parse(
      response.content
        .replace(/^json\s*/i, '')
        .replace(/```/g, '')
        .trim()
    );
    // console.log("----------------------------------------")
    // console.log("Validation result:", result);
    // console.log("----------------------------------------")
    
    console.log(`Analysis result for ${component.name}:`, 
    result.meetsRequirements ? "VALID" : "INVALID");
    io.emit("message", `Analysis result for ${component.name}: ${result.meetsRequirements ? "VALID" : "INVALID"}`);
    return result;
  };

  /**
   * Selenium Generator Tool - Creates test scripts
   * Input: { componentName: string, testCases: string[] }
   * Output: string (generated test script)
   */
  const seleniumGenerator = async (componentName, testCases,url,dependencies,codeFragment) => {
    console.log(`\nGenerating Selenium tests for: ${componentName}`);
    io.emit("message", `\nGenerating Selenium tests for: ${componentName}`);
    console.log("Test cases received:");
    io.emit("message", `Test cases received: ${JSON.stringify(testCases)}`);

    // Create and execute test generation prompt
    const prompt = secondLevelWorkerPrompt

    const chain = prompt.pipe(seleniumLLM);
    const response = await chain.invoke({
      componentName: componentName,
      testCases: testCases,
      url,
      dependencies,
      codeContext : codeFragment
    });

    console.log(`Tests generated for ${componentName}`);
    io.emit("message", `Tests generated for ${componentName}`);
    return response.content;
  };

  async function runWorkflow(srsDocument, developedCode) {
    const url = "http://localhost:3000"
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
        components: {
          default: () => [],
          aggregate: "last"
        },
        analysisResults: {
          default: () => [],
          aggregate: "last"
        },
        seleniumScripts: {
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
    workflow.addNode("master_analysis", masterAnalyzer);

    workflow.addNode("component_analysis", async (state) => {
      console.log("\n=== COMPONENT ANALYSIS PHASE STARTED ===");
      io.emit("message", "\n=== COMPONENT ANALYSIS PHASE STARTED ===");
      console.log(`Processing ${state.components.length} components`);
      io.emit("message", `Processing ${state.components.length} components`);
      
      const results = [];
      for (const component of state.components) {
        console.log(`\nProcessing component: ${component.name}`);
        io.emit("message", `\nProcessing component: ${component.name}`);
        const analysis = await componentAnalyzer(component);
        results.push({ component: component.name, ...analysis });
      }

      console.log("Component analysis results:", results);
      io.emit("message", `Component analysis results: ${JSON.stringify(results)}`);
      console.log("=== COMPONENT ANALYSIS PHASE COMPLETED ===\n");
      io.emit("message", "=== COMPONENT ANALYSIS PHASE COMPLETED ===");
      return { ...state, analysisResults: results };
    });

    workflow.addNode("generate_selenium", async (state) => {
      console.log("\n=== SELENIUM GENERATION STARTED ===");
      io.emit("message", "\n=== SELENIUM GENERATION STARTED ===");
      const validComponents = state.analysisResults.filter(r => r.meetsRequirements);
      console.log(`Generating tests for ${validComponents.length} valid components`);
      io.emit("message", `Generating tests for ${validComponents.length} valid components`);

      const scripts = [];
      for (const result of validComponents) {
        console.log(`\nGenerating tests for: ${result.component}`);
        io.emit("message", `\nGenerating tests for: ${result.component}`);
        const script = await seleniumGenerator(result.component, result.testCases,url,result.dependencies,result.codeFragment); 
        scripts.push({ component: result.component, script, testCases: result.testCases });
      }

      console.log(`Generated ${scripts.length} test scripts`);
      io.emit("message", `Generated ${scripts.length} test scripts`);
      console.log("=== SELENIUM GENERATION COMPLETED ===\n");
      io.emit("message", "=== SELENIUM GENERATION COMPLETED ===");
      return { ...state, seleniumScripts: scripts };
    });

    workflow.addNode("handle_errors", (state) => {
      console.log("\n=== ERROR HANDLING PHASE ===");
      io.emit("message", "\n=== ERROR HANDLING PHASE ===");
      const errors = state.analysisResults
        .filter(r => !r.meetsRequirements)
        .map(r => ({
          component: r.component,
          issues: r.details,
          requiredActions: "Review SRS requirements and code implementation"
        }));

      console.log(`Found ${errors.length} components with issues`);
      io.emit("message", `Found ${errors.length} components with issues`);
      console.log("Components with errors:", errors.map(e => e.component));
      io.emit("message", `Components with errors: ${errors.map(e => e.component).join(', ')}`);
      return { ...state, validationErrors: errors };
    });

    // Define workflow transitions
    workflow.addEdge("master_analysis", "component_analysis");

    workflow.addConditionalEdges(
      "component_analysis",
      (state) => {
        const hasValidComponents = state.analysisResults.some(r => r.meetsRequirements);
        console.log(`\nValidation check: ${hasValidComponents ? "SOME VALID COMPONENTS" : "ALL FAILED"}`);
        io.emit("message", `\nValidation check: ${hasValidComponents ? "SOME VALID COMPONENTS" : "ALL FAILED"}`);
    
        return hasValidComponents ? "generate_selenium" : "handle_errors";
      },
      { generate_selenium: "generate_selenium", handle_errors: "handle_errors" }
    );
    

    workflow.addEdge("generate_selenium", END);
    workflow.addEdge("handle_errors", END);

    workflow.setEntryPoint("master_analysis");

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
    
    if (executionResult && executionResult.seleniumScripts) {
      console.log("Generated scripts:", executionResult.seleniumScripts.map(s => s.component));
      io.emit("message", `Generated scripts: ${executionResult.seleniumScripts.map(s => s.component).join(', ')}`);
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