// prompts.js

export const generateTestPrompt = (context) => `
Act as an expert QA Lead.
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

${context}`;

export const generateSeleniumTestPrompt = (testDocument, figmaJSON, url) => `
Role: Expert Selenium Automation Engineer.

Inputs:

Test Case Plan: (Provided between the START/END markers below) Contains scenarios and detailed test cases (ID, Title, Steps, Data, Expected Results).

--- START TEST CASE PLAN ---
${testDocument}
--- END TEST CASE PLAN ---

Figma Component JSON: (Provided between the START/END markers below) Contains UI element details (id, name, type, class, data-testid, etc.).


URL: ${url}

Task: Generate Selenium WebDriver code in JavaScript implementing ALL test cases specified in the Test Case Plan.

Strict Instructions:

- Use ES6 modules, NOT CommonJS. Ensure import statements are used instead of require.
- Output: Output ONLY the raw Selenium JavaScript code. DO NOT include any introduction, explanation, summary, or any text before or after the code.
- Locator Strategy: MUST use the Figma Component JSON to derive element locators. Prioritize in this order: data-testid, id, unique/stable name, specific class combinations, or robust CSS Selectors based only on the provided JSON attributes.

Implementation:

- Generate code for every test case in the plan.
- Structure tests logically (e.g., functions per test case). Name functions clearly, mirroring the Test Case ID or Title (e.g., async function TC_001_01_VerifyValidLogin()).
- Use ES6 module syntax for importing Selenium (import { Builder, By, until } from 'selenium-webdriver').
- Include appropriate waits (driver.wait(until.elementLocated(...)), driver.wait(until.elementIsVisible(...))) before interactions and assertions to ensure stability.
- Ensure a main executable method that initializes WebDriver, runs all test cases sequentially, and properly quits the driver at the end.
- The output must be fully runnable JavaScript code (assuming necessary dependencies are installed).

Logging Requirement:

- Every test case execution must log its progress in JSON format.
- The JSON must include the following fields:
  - "testCaseID": Unique identifier of the test case.
  - "testCaseTitle": The title or description of the test case.
  - "executionStartTime": Timestamp when the test case started execution.
  - "executionEndTime": Timestamp when the test case finished execution.
  - "status": "PASS" or "FAIL" depending on execution success.
  - "errorMessage": If the test fails, include the error message, otherwise set to "null".
- Use "console.log(JSON.stringify(...))" for structured logging.

Example Log Format:

\`\`\`json
{
  "testCaseID": "TC_001",
  "testCaseTitle": "Verify User Login with Valid Credentials",
  "executionStartTime": "2025-03-30T12:34:56Z",
  "executionEndTime": "2025-03-30T12:34:58Z",
  "status": "PASS",
  "errorMessage": null
}
\`\`\`
`;

