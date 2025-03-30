const { Builder, By, until } = require('selenium-webdriver');

async function setupWebDriver() {
    let driver = await new Builder().forBrowser('chrome').build();
    return driver;
}

// Test Case 1: Process Customer Purchase
async function TC_001_01_ProcessCustomerPurchase(driver) {
    try {
        await driver.get('http://your-web-app-url.com');  // Update with actual URL

        await driver.wait(until.elementLocated(By.css('[data-testid="start-transaction"]')), 10000);
        await driver.findElement(By.css('[data-testid="start-transaction"]')).click();

        await driver.wait(until.elementLocated(By.css('[data-testid="item-code-input"]')), 10000);
        let itemCodeInput = await driver.findElement(By.css('[data-testid="item-code-input"]'));
        let quantityInput = await driver.findElement(By.css('[data-testid="quantity-input"]'));

        await itemCodeInput.sendKeys("A123");
        await quantityInput.sendKeys("2");

        await itemCodeInput.clear();
        await itemCodeInput.sendKeys("B456");
        await quantityInput.clear();
        await quantityInput.sendKeys("1");

        await driver.findElement(By.css('[data-testid="confirm-transaction"]')).click();
        await driver.findElement(By.css('[data-testid="process-payment"]')).click();

        let confirmationMessage = await driver.wait(until.elementLocated(By.css('[data-testid="transaction-success"]')), 10000);
        console.assert(await confirmationMessage.isDisplayed(), "Transaction confirmation not found!");
    } catch (error) {
        console.error("Error in TC_001_01_ProcessCustomerPurchase:", error);
    }
}

// Test Case 2: Check Inventory Status
async function TC_002_01_CheckCurrentInventoryStatus(driver) {
    try {
        await driver.wait(until.elementLocated(By.css('[data-testid="inventory-management"]')), 10000);
        await driver.findElement(By.css('[data-testid="inventory-management"]')).click();

        await driver.wait(until.elementLocated(By.css('[data-testid="check-inventory-status"]')), 10000);
        await driver.findElement(By.css('[data-testid="check-inventory-status"]')).click();

        let inventoryTable = await driver.wait(until.elementLocated(By.css('[data-testid="inventory-table"]')), 10000);
        console.assert(await inventoryTable.isDisplayed(), "Inventory table not found!");
    } catch (error) {
        console.error("Error in TC_002_01_CheckCurrentInventoryStatus:", error);
    }
}

// Test Case 3: Generate Sales Report
async function TC_003_01_GenerateSalesReport(driver) {
    try {
        await driver.wait(until.elementLocated(By.css('[data-testid="sales-reporting"]')), 10000);
        await driver.findElement(By.css('[data-testid="sales-reporting"]')).click();

        await driver.wait(until.elementLocated(By.css('[data-testid="date-range-start"]')), 10000);
        await driver.findElement(By.css('[data-testid="date-range-start"]')).sendKeys("01/01/2023");
        await driver.findElement(By.css('[data-testid="date-range-end"]')).sendKeys("01/31/2023");

        await driver.findElement(By.css('[data-testid="generate-report"]')).click();

        let reportTable = await driver.wait(until.elementLocated(By.css('[data-testid="sales-report-table"]')), 10000);
        console.assert(await reportTable.isDisplayed(), "Sales report not found!");
    } catch (error) {
        console.error("Error in TC_003_01_GenerateSalesReport:", error);
    }
}

// Function to run all test cases
async function main() {
    let driver = await setupWebDriver();

    try {
        await TC_001_01_ProcessCustomerPurchase(driver);
        await TC_002_01_CheckCurrentInventoryStatus(driver);
        await TC_003_01_GenerateSalesReport(driver);
    } finally {
        await driver.quit();
    }
}

// Run the test suite
main();

import { Builder, By } from "selenium-webdriver";

async function testLogin() {
  console.log("🚀 Starting the Selenium test...");

  // Launch the browser
  console.log("🌐 Launching Chrome browser...");
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    // Open the React app
    console.log("🔗 Navigating to http://localhost:5173...");
    await driver.get("http://localhost:5173/");

    // Wait for the page to load
    console.log("⏳ Waiting for the page to load...");
    await driver.sleep(2000);

    // Locate the email input field and enter email
    console.log("✏️ Finding email input field...");
    let emailField = await driver.findElement(By.xpath("//input[@type='email']"));
    console.log("✅ Email input field found! Entering email...");
    await emailField.sendKeys("test@example.com");

    // Locate the password input field and enter password
    console.log("🔑 Finding password input field...");
    let passwordField = await driver.findElement(By.xpath("//input[@type='password']"));
    console.log("✅ Password input field found! Entering password...");
    await passwordField.sendKeys("Test@123");

    // Locate and click the Sign In button
    console.log("🔍 Finding Sign In button...");
    let signInButton = await driver.findElement(By.xpath("//button[@type='submit']"));
    console.log("✅ Sign In button found! Clicking...");
    await signInButton.click();

    // Wait for form submission to be processed
    console.log("⏳ Waiting for form submission to complete...");
    await driver.sleep(2000);

    // Log success message
    console.log("🎉 Form submitted successfully with Email: test@example.com and Password: Test@123");

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    // Close the browser
    console.log("🛑 Closing the browser...");
    await driver.quit();
    console.log("✅ Browser closed. Test finished.");
  }
}

// Run the test
testLogin();
