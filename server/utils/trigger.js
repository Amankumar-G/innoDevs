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