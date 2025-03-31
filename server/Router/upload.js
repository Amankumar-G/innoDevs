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
import fs from "fs/promises"; // Using promise-based fs
import { exec } from "child_process";
import { promisify } from "util";

import { fileURLToPath } from "url";

const execPromise = promisify(exec); // Convert exec to promise-based

// Helper to get the directory of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TARGET_DIR = path.resolve("../rapido_testing/src");
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
let scripts = [
  '```javascript\n' +
    'console.log("App");\n' +
    '\n' +
    "import { Builder, By, until } from 'selenium-webdriver';\n" +
    '\n' +
    'async function renderAppComponent(driver) {\n' +
    '    const executionStartTime = new Date();\n' +
    '    try {\n' +
    '        await driver.get("http://localhost:3000");\n' +
    "        await driver.wait(until.elementLocated(By.css('app-component-selector')), 10000);\n" +
    "        const appComponent = await driver.findElement(By.css('app-component-selector'));\n" +
    '        const isDisplayed = await appComponent.isDisplayed();\n' +
    '        const status = isDisplayed ? "PASS" : "FAIL";\n' +
    '        const executionEndTime = new Date();\n' +
    '        console.log(JSON.stringify({\n' +
    '            testCaseID: 1,\n' +
    '            testCaseTitle: "Render App Component",\n' +
    '            executionStartTime,\n' +
    '            executionEndTime,\n' +
    '            status,\n' +
    '            errorMessage: isDisplayed ? null : "App component did not render."\n' +
    '        }));\n' +
    '    } catch (error) {\n' +
    '        console.log(JSON.stringify({\n' +
    '            error: true,\n' +
    '            errorType: "System Failure",\n' +
    '            errorMessage: error.message,\n' +
    '            suggestedResolution: "Check if the application is running and accessible."\n' +
    '        }));\n' +
    '    }\n' +
    '}\n' +
    '\n' +
    'async function navigationToHome(driver) {\n' +
    '    const executionStartTime = new Date();\n' +
    '    try {\n' +
    "        await driver.wait(until.elementLocated(By.linkText('Home')), 10000);\n" +
    "        await driver.findElement(By.linkText('Home')).click();\n" +
    "        await driver.wait(until.elementLocated(By.css('home-component-selector')), 10000);\n" +
    "        const homeComponent = await driver.findElement(By.css('home-component-selector'));\n" +
    '        const isDisplayed = await homeComponent.isDisplayed();\n' +
    '        const status = isDisplayed ? "PASS" : "FAIL";\n' +
    '        const executionEndTime = new Date();\n' +
    '        console.log(JSON.stringify({\n' +
    '            testCaseID: 2,\n' +
    '            testCaseTitle: "Navigation to Home",\n' +
    '            executionStartTime,\n' +
    '            executionEndTime,\n' +
    '            status,\n' +
    '            errorMessage: isDisplayed ? null : "Home component did not display."\n' +
    '        }));\n' +
    '    } catch (error) {\n' +
    '        console.log(JSON.stringify({\n' +
    '            error: true,\n' +
    '            errorType: "System Failure",\n' +
    '            errorMessage: error.message,\n' +
    '            suggestedResolution: "Check if the Home link is available."\n' +
    '        }));\n' +
    '    }\n' +
    '}\n' +
    '\n' +
    'async function navigationToContact(driver) {\n' +
    '    const executionStartTime = new Date();\n' +
    '    try {\n' +
    "        await driver.wait(until.elementLocated(By.linkText('Contact')), 10000);\n" +
    "        await driver.findElement(By.linkText('Contact')).click();\n" +
    "        await driver.wait(until.elementLocated(By.css('contact-component-selector')), 10000);\n" +
    "        const contactComponent = await driver.findElement(By.css('contact-component-selector'));\n" +
    '        const isDisplayed = await contactComponent.isDisplayed();\n' +
    '        const status = isDisplayed ? "PASS" : "FAIL";\n' +
    '        const executionEndTime = new Date();\n' +
    '        console.log(JSON.stringify({\n' +
    '            testCaseID: 3,\n' +
    '            testCaseTitle: "Navigation to Contact",\n' +
    '            executionStartTime,\n' +
    '            executionEndTime,\n' +
    '            status,\n' +
    '            errorMessage: isDisplayed ? null : "Contact component did not display."\n' +
    '        }));\n' +
    '    } catch (error) {\n' +
    '        console.log(JSON.stringify({\n' +
    '            error: true,\n' +
    '            errorType: "System Failure",\n' +
    '            errorMessage: error.message,\n' +
    '            suggestedResolution: "Check if the Contact link is available."\n' +
    '        }));\n' +
    '    }\n' +
    '}\n' +
    '\n' +
    'async function homeComponentRendering(driver) {\n' +
    '    const executionStartTime = new Date();\n' +
    '    try {\n' +
    '        await driver.get("http://localhost:3000/home");\n' +
    "        await driver.wait(until.elementLocated(By.css('home-heading-selector')), 10000);\n" +
    "        const heading = await driver.findElement(By.css('home-heading-selector'));\n" +
    "        const image = await driver.findElement(By.css('home-image-selector'));\n" +
    '        const isHeadingDisplayed = await heading.isDisplayed();\n' +
    '        const isImageDisplayed = await image.isDisplayed();\n' +
    '        const status = (isHeadingDisplayed && isImageDisplayed) ? "PASS" : "FAIL";\n' +
    '        const executionEndTime = new Date();\n' +
    '        console.log(JSON.stringify({\n' +
    '            testCaseID: 4,\n' +
    '            testCaseTitle: "Home Component Rendering",\n' +
    '            executionStartTime,\n' +
    '            executionEndTime,\n' +
    '            status,\n' +
    '            errorMessage: status === "FAIL" ? "Heading or image did not display." : null\n' +
    '        }));\n' +
    '    } catch (error) {\n' +
    '        console.log(JSON.stringify({\n' +
    '            error: true,\n' +
    '            errorType: "System Failure",\n' +
    '            errorMessage: error.message,\n' +
    '            suggestedResolution: "Check if the Home component is accessible."\n' +
    '        }));\n' +
    '    }\n' +
    '}\n' +
    '\n' +
    'async function contactFormSubmission(driver) {\n' +
    '    const executionStartTime = new Date();\n' +
    '    try {\n' +
    '        await driver.get("http://localhost:3000/contact");\n' +
    "        await driver.wait(until.elementLocated(By.css('contact-form-selector')), 10000);\n" +
    `        await driver.findElement(By.css('input[name="name"]')).sendKeys("Test User");\n` +
    `        await driver.findElement(By.css('input[name="email"]')).sendKeys("test@example.com");\n` +
    `        await driver.findElement(By.css('textarea[name="message"]')).sendKeys("Hello!");\n` +
    `        await driver.findElement(By.css('button[type="submit"]')).click();\n` +
    '        await driver.wait(until.alertIsPresent(), 10000);\n' +
    '        const alert = await driver.switchTo().alert();\n' +
    '        const alertText = await alert.getText();\n' +
    '        await alert.accept();\n' +
    '        const status = alertText.includes("success") ? "PASS" : "FAIL";\n' +
    '        const executionEndTime = new Date();\n' +
    '        console.log(JSON.stringify({\n' +
    '            testCaseID: 5,\n' +
    '            testCaseTitle: "Contact Form Submission",\n' +
    '            executionStartTime,\n' +
    '            executionEndTime,\n' +
    '            status,\n' +
    '            errorMessage: status === "FAIL" ? "Alert message did not indicate success." : null\n' +
    '        }));\n' +
    '    } catch (error) {\n' +
    '        console.log(JSON.stringify({\n' +
    '            error: true,\n' +
    '            errorType: "System Failure",\n' +
    '            errorMessage: error.message,\n' +
    '            suggestedResolution: "Check if the Contact form is accessible."\n' +
    '        }));\n' +
    '    }\n' +
    '}\n' +
    '\n' +
    'async function contactFormValidation(driver) {\n' +
    '    const executionStartTime = new Date();\n' +
    '    try {\n' +
    '        await driver.get("http://localhost:3000/contact");\n' +
    "        await driver.wait(until.elementLocated(By.css('contact-form-selector')), 10000);\n" +
    `        await driver.findElement(By.css('button[type="submit"]')).click();\n` +
    "        const errorMessage = await driver.findElement(By.css('.error-message-selector'));\n" +
    '        const isDisplayed = await errorMessage.isDisplayed();\n' +
    '        const status = isDisplayed ? "PASS" : "FAIL";\n' +
    '        const executionEndTime = new Date();\n' +
    '        console.log(JSON.stringify({\n' +
    '            testCaseID: 6,\n' +
    '            testCaseTitle: "Contact Form Validation",\n' +
    '            executionStartTime,\n' +
    '            executionEndTime,\n' +
    '            status,\n' +
    '            errorMessage: status === "FAIL" ? "Validation errors did not display." : null\n' +
    '        }));\n' +
    '    } catch (error) {\n' +
    '        console.log(JSON.stringify({\n' +
    '            error: true,\n' +
    '            errorType: "System Failure",\n' +
    '            errorMessage: error.message,\n' +
    '            suggestedResolution: "Check if the Contact form is accessible."\n' +
    '        }));\n' +
    '    }\n' +
    '}\n' +
    '\n' +
    'async function main() {\n' +
    '    let driver;\n' +
    '    try {\n' +
    "        driver = await new Builder().forBrowser('chrome').build();\n" +
    '        await renderAppComponent(driver);\n' +
    '        await navigationToHome(driver);\n' +
    '        await navigationToContact(driver);\n' +
    '        await homeComponentRendering(driver);\n' +
    '        await contactFormSubmission(driver);\n' +
    '        await contactFormValidation(driver);\n' +
    '    } catch (error) {\n' +
    '        console.log(JSON.stringify({\n' +
    '            error: true,\n' +
    '            errorType: "System Failure",\n' +
    '            errorMessage: error.message,\n' +
    '            suggestedResolution: "Check the WebDriver setup."\n' +
    '        }));\n' +
    '    } finally {\n' +
    '        if (driver) {\n' +
    '            await driver.quit();\n' +
    '        }\n' +
    '    }\n' +
    '}\n' +
    '\n' +
    'main();\n' +
    '```',
  '```javascript\n' +
    'console.log("Home");\n' +
    '\n' +
    "import { Builder, By, until } from 'selenium-webdriver';\n" +
    '\n' +
    'const url = "http://localhost:3000";\n' +
    '\n' +
    'async function renderHomeComponent() {\n' +
    '    const startTime = new Date();\n' +
    '    let result = { testCaseID: 1, testCaseTitle: "Render Home Component", executionStartTime: startTime };\n' +
    '    let driver;\n' +
    '\n' +
    '    try {\n' +
    "        driver = await new Builder().forBrowser('chrome').build();\n" +
    '        await driver.get(url);\n' +
    "        await driver.wait(until.elementLocated(By.css('h1')), 10000);\n" +
    "        await driver.wait(until.elementIsVisible(driver.findElement(By.css('h1'))), 10000);\n" +
    "        const heading = await driver.findElement(By.css('h1')).getText();\n" +
    "        const image = await driver.findElement(By.css('img')).getAttribute('src');\n" +
    '        result.status = (heading === "We deliver AI-powered intelligence." && image === "src/download.jpeg") ? "PASS" : "FAIL";\n' +
    '    } catch (error) {\n' +
    '        result.status = "FAIL";\n' +
    '        result.errorMessage = error.message;\n' +
    '    } finally {\n' +
    '        const endTime = new Date();\n' +
    '        result.executionEndTime = endTime;\n' +
    '        console.log(JSON.stringify(result));\n' +
    '        if (driver) await driver.quit();\n' +
    '    }\n' +
    '}\n' +
    '\n' +
    'async function checkHeadingText() {\n' +
    '    const startTime = new Date();\n' +
    '    let result = { testCaseID: 2, testCaseTitle: "Check Heading Text", executionStartTime: startTime };\n' +   
    '    let driver;\n' +
    '\n' +
    '    try {\n' +
    "        driver = await new Builder().forBrowser('chrome').build();\n" +
    '        await driver.get(url);\n' +
    "        await driver.wait(until.elementLocated(By.css('h1')), 10000);\n" +
    "        const heading = await driver.findElement(By.css('h1')).getText();\n" +
    '        result.status = (heading === "We deliver AI-powered intelligence.") ? "PASS" : "FAIL";\n' +
    '    } catch (error) {\n' +
    '        result.status = "FAIL";\n' +
    '        result.errorMessage = error.message;\n' +
    '    } finally {\n' +
    '        const endTime = new Date();\n' +
    '        result.executionEndTime = endTime;\n' +
    '        console.log(JSON.stringify(result));\n' +
    '        if (driver) await driver.quit();\n' +
    '    }\n' +
    '}\n' +
    '\n' +
    'async function checkImageSource() {\n' +
    '    const startTime = new Date();\n' +
    '    let result = { testCaseID: 3, testCaseTitle: "Check Image Source", executionStartTime: startTime };\n' +   
    '    let driver;\n' +
    '\n' +
    '    try {\n' +
    "        driver = await new Builder().forBrowser('chrome').build();\n" +
    '        await driver.get(url);\n' +
    "        await driver.wait(until.elementLocated(By.css('img')), 10000);\n" +
    "        const imageSource = await driver.findElement(By.css('img')).getAttribute('src');\n" +
    '        result.status = (imageSource === "src/download.jpeg") ? "PASS" : "FAIL";\n' +
    '    } catch (error) {\n' +
    '        result.status = "FAIL";\n' +
    '        result.errorMessage = error.message;\n' +
    '    } finally {\n' +
    '        const endTime = new Date();\n' +
    '        result.executionEndTime = endTime;\n' +
    '        console.log(JSON.stringify(result));\n' +
    '        if (driver) await driver.quit();\n' +
    '    }\n' +
    '}\n' +
    '\n' +
    'async function checkImageAltText() {\n' +
    '    const startTime = new Date();\n' +
    '    let result = { testCaseID: 4, testCaseTitle: "Check Image Alt Text", executionStartTime: startTime };\n' + 
    '    let driver;\n' +
    '\n' +
    '    try {\n' +
    "        driver = await new Builder().forBrowser('chrome').build();\n" +
    '        await driver.get(url);\n' +
    "        await driver.wait(until.elementLocated(By.css('img')), 10000);\n" +
    "        const altText = await driver.findElement(By.css('img')).getAttribute('alt');\n" +
    '        result.status = (altText === "Home") ? "PASS" : "FAIL";\n' +
    '    } catch (error) {\n' +
    '        result.status = "FAIL";\n' +
    '        result.errorMessage = error.message;\n' +
    '    } finally {\n' +
    '        const endTime = new Date();\n' +
    '        result.executionEndTime = endTime;\n' +
    '        console.log(JSON.stringify(result));\n' +
    '        if (driver) await driver.quit();\n' +
    '    }\n' +
    '}\n' +
    '\n' +
    'async function checkComponentStyling() {\n' +
    '    const startTime = new Date();\n' +
    '    let result = { testCaseID: 5, testCaseTitle: "Check Component Styling", executionStartTime: startTime };\n' +
    '    let driver;\n' +
    '\n' +
    '    try {\n' +
    "        driver = await new Builder().forBrowser('chrome').build();\n" +
    '        await driver.get(url);\n' +
    "        await driver.wait(until.elementLocated(By.css('.home-container')), 10000);\n" +
    "        const classes = await driver.findElement(By.css('.home-container')).getAttribute('class');\n" +        
    "        const expectedClasses = ['flex', 'flex-col', 'items-center', 'justify-center', 'min-h-screen', 'bg-gray-100'];\n" +
    '        const allClassesPresent = expectedClasses.every(cls => classes.includes(cls));\n' +
    '        result.status = allClassesPresent ? "PASS" : "FAIL";\n' +
    '    } catch (error) {\n' +
    '        result.status = "FAIL";\n' +
    '        result.errorMessage = error.message;\n' +
    '    } finally {\n' +
    '        const endTime = new Date();\n' +
    '        result.executionEndTime = endTime;\n' +
    '        console.log(JSON.stringify(result));\n' +
    '        if (driver) await driver.quit();\n' +
    '    }\n' +
    '}\n' +
    '\n' +
    'async function main() {\n' +
    '    await renderHomeComponent();\n' +
    '    await checkHeadingText();\n' +
    '    await checkImageSource();\n' +
    '    await checkImageAltText();\n' +
    '    await checkComponentStyling();\n' +
    '}\n' +
    '\n' +
    'main();\n' +
    '```',
  '```javascript\n' +
    'console.log("Contact");\n' +
    '\n' +
    "import { Builder, By, until } from 'selenium-webdriver';\n" +
    '\n' +
    'async function validFormSubmission(driver) {\n' +
    '    const executionStartTime = new Date();\n' +
    '    try {\n' +
    '        await driver.get("http://localhost:3000");\n' +
    "        await driver.wait(until.elementLocated(By.name('firstName')), 10000);\n" +
    "        await driver.findElement(By.name('firstName')).sendKeys('John');\n" +
    "        await driver.findElement(By.name('lastName')).sendKeys('Doe');\n" +
    "        await driver.findElement(By.name('email')).sendKeys('john.doe@example.com');\n" +
    "        await driver.findElement(By.name('company')).sendKeys('Example Inc.');\n" +
    "        await driver.findElement(By.name('role')).sendKeys('Developer');\n" +
    "        await driver.findElement(By.name('projectDescription')).sendKeys('This is a test project.');\n" +      
    "        await driver.findElement(By.id('submit')).click();\n" +
    '        await driver.wait(until.alertIsPresent(), 10000);\n' +
    '        const alert = await driver.switchTo().alert();\n' +
    '        const alertText = await alert.getText();\n' +
    '        await alert.accept();\n' +
    "        const consoleLog = await driver.executeScript('return console.log;');\n" +
    "        const expectedLog = 'Form submitted!';\n" +
    `        const status = alertText === expectedLog && consoleLog.includes('{"firstName":"John","lastName":"Doe","email":"john.doe@example.com","company":"Example Inc.","role":"Developer","projectDescription":"This is a test project."}') ? 'PASS' : 'FAIL';\n` +
    '        const executionEndTime = new Date();\n' +
    '        console.log(JSON.stringify({ testCaseID: 1, testCaseTitle: "Valid Form Submission", executionStartTime, executionEndTime, status }));\n' +
    '    } catch (error) {\n' +
    '        console.log(JSON.stringify({ error: true, errorType: "Script Generation Error", errorMessage: error.message, suggestedResolution: "Check the form field names and ensure the form is accessible." }));\n' +
    '    }\n' +
    '}\n' +
    '\n' +
    'async function emptyRequiredFields(driver) {\n' +
    '    const executionStartTime = new Date();\n' +
    '    try {\n' +
    '        await driver.get("http://localhost:3000");\n' +
    "        await driver.wait(until.elementLocated(By.id('submit')), 10000);\n" +
    "        await driver.findElement(By.id('submit')).click();\n" +
    "        const validationMessage = await driver.findElement(By.className('error')).getText();\n" +
    "        const status = validationMessage.includes('This field is required') ? 'PASS' : 'FAIL';\n" +
    '        const executionEndTime = new Date();\n' +
    '        console.log(JSON.stringify({ testCaseID: 2, testCaseTitle: "Empty Required Fields", executionStartTime, executionEndTime, status }));\n' +
    '    } catch (error) {\n' +
    '        console.log(JSON.stringify({ error: true, errorType: "Script Generation Error", errorMessage: error.message, suggestedResolution: "Check the form validation messages." }));\n' +
    '    }\n' +
    '}\n' +
    '\n' +
    'async function invalidEmailFormat(driver) {\n' +
    '    const executionStartTime = new Date();\n' +
    '    try {\n' +
    '        await driver.get("http://localhost:3000");\n' +
    "        await driver.wait(until.elementLocated(By.name('firstName')), 10000);\n" +
    "        await driver.findElement(By.name('firstName')).sendKeys('John');\n" +
    "        await driver.findElement(By.name('lastName')).sendKeys('Doe');\n" +
    "        await driver.findElement(By.name('email')).sendKeys('invalid-email');\n" +
    "        await driver.findElement(By.name('company')).sendKeys('Example Inc.');\n" +
    "        await driver.findElement(By.name('role')).sendKeys('Developer');\n" +
    "        await driver.findElement(By.name('projectDescription')).sendKeys('This is a test project.');\n" +      
    "        await driver.findElement(By.id('submit')).click();\n" +
    "        const validationMessage = await driver.findElement(By.className('error')).getText();\n" +
    "        const status = validationMessage.includes('Invalid email format') ? 'PASS' : 'FAIL';\n" +
    '        const executionEndTime = new Date();\n' +
    '        console.log(JSON.stringify({ testCaseID: 3, testCaseTitle: "Invalid Email Format", executionStartTime, executionEndTime, status }));\n' +
    '    } catch (error) {\n' +
    '        console.log(JSON.stringify({ error: true, errorType: "Script Generation Error", errorMessage: error.message, suggestedResolution: "Check the email validation logic." }));\n' +
    '    }\n' +
    '}\n' +
    '\n' +
    'async function edgeCaseMaximumLengthInputs(driver) {\n' +
    '    const executionStartTime = new Date();\n' +
    '    try {\n' +
    '        await driver.get("http://localhost:3000");\n' +
    "        await driver.wait(until.elementLocated(By.name('firstName')), 10000);\n" +
    "        await driver.findElement(By.name('firstName')).sendKeys('A'.repeat(50));\n" +
    "        await driver.findElement(By.name('lastName')).sendKeys('B'.repeat(50));\n" +
    "        await driver.findElement(By.name('email')).sendKeys('max.length@example.com');\n" +
    "        await driver.findElement(By.name('company')).sendKeys('C'.repeat(50));\n" +
    "        await driver.findElement(By.name('role')).sendKeys('D'.repeat(50));\n" +
    "        await driver.findElement(By.name('projectDescription')).sendKeys('E'.repeat(200));\n" +
    "        await driver.findElement(By.id('submit')).click();\n" +
    '        await driver.wait(until.alertIsPresent(), 10000);\n' +
    '        const alert = await driver.switchTo().alert();\n' +
    '        const alertText = await alert.getText();\n' +
    '        await alert.accept();\n' +
    "        const expectedLog = 'Form submitted!';\n" +
    "        const status = alertText === expectedLog ? 'PASS' : 'FAIL';\n" +
    '        const executionEndTime = new Date();\n' +
    '        console.log(JSON.stringify({ testCaseID: 4, testCaseTitle: "Edge Case - Maximum Length Inputs", executionStartTime, executionEndTime, status }));\n' +
    '    } catch (error) {\n' +
    '        console.log(JSON.stringify({ error: true, errorType: "Script Generation Error", errorMessage: error.message, suggestedResolution: "Check the maximum length constraints." }));\n' +
    '    }\n' +
    '}\n' +
    '\n' +
    'async function performanceTestFormLoadTime(driver) {\n' +
    '    const executionStartTime = new Date();\n' +
    '    try {\n' +
    '        const startTime = new Date();\n' +
    '        await driver.get("http://localhost:3000");\n' +
    "        await driver.wait(until.elementLocated(By.id('form')), 2000);\n" +
    '        const endTime = new Date();\n' +
    '        const loadTime = endTime - startTime;\n' +
    "        const status = loadTime < 2000 ? 'PASS' : 'FAIL';\n" +
    '        const executionEndTime = new Date();\n' +
    '        console.log(JSON.stringify({ testCaseID: 5, testCaseTitle: "Performance Test - Form Load Time", executionStartTime, executionEndTime, status }));\n' +
    '    } catch (error) {\n' +
    '        console.log(JSON.stringify({ error: true, errorType: "Script Generation Error", errorMessage: error.message, suggestedResolution: "Check the form loading mechanism." }));\n' +
    '    }\n' +
    '}\n' +
    '\n' +
    'async function main() {\n' +
    '    let driver;\n' +
    '    try {\n' +
    "        driver = await new Builder().forBrowser('chrome').build();\n" +
    '        await validFormSubmission(driver);\n' +
    '        await emptyRequiredFields(driver);\n' +
    '        await invalidEmailFormat(driver);\n' +
    '        await edgeCaseMaximumLengthInputs(driver);\n' +
    '        await performanceTestFormLoadTime(driver);\n' +
    '    } catch (error) {\n' +
    '        console.log(JSON.stringify({ error: true, errorType: "System Failure", errorMessage: error.message, suggestedResolution: "Ensure the WebDriver is correctly set up." }));\n' +
    '    } finally {\n' +
    '        if (driver) {\n' +
    '            await driver.quit();\n' +
    '        }\n' +
    '    }\n' +
    '}\n' +
    '\n' +
    'main();\n' +
    '```'
]
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
  io.emit("message", `[Server] Execution request received.`);

  console.log(scripts);
  try {
    for (let i = 0; i < scripts.length; i++) {
      const scriptContent = scripts[i].replace(/^```javascript\n/, "").replace(/\n```$/, "");
      const scriptPath = path.join(__dirname, `script_${i + 1}.js`);

      // Write script content to a file
      await fs.writeFile(scriptPath, scriptContent);
      console.log(`✅ [Server] Script ${i + 1} saved: ${scriptPath}`);
      io.emit(`message`, `✅ [Server] Script ${i + 1} saved: ${scriptPath}`);

      // Execute the script and log output
      try {
        const { stdout, stderr } = await execPromise(`node ${scriptPath}`);
        console.log(`📜 [Output of script ${i + 1}]:\n${stdout}`);
        io.emit(`message`,`📜 [Output of script ${i + 1}]:\n${stdout}`);
        if (stderr) {console.error(`⚠️ [Server] Script ${i + 1} stderr:\n${stderr}`);
        io.emit(`message`, `⚠️ [Server] Script ${i + 1} stderr:\n${stderr}`);
        }
      } catch (error) {
        console.error(`❌ [Server] Error executing script ${i + 1}:`, error);
        io.emit(`message`, `❌ [Server] Error executing script ${i + 1}: ${error.message}`);
      }

      // Remove the script file after execution
      await fs.unlink(scriptPath);
      console.log(`🗑️ [Server] Script ${i + 1} deleted`);
      io.emit(`message`, `🗑️ [Server] Script ${i + 1} deleted`);
    }

    res.json({ message: "Selenium test execution completed." });
  } catch (error) {
    console.error("❌ [Server] Error executing test scripts:", error);
    res.status(500).json({ error: "Failed to execute test scripts." });
  }
});


export default router;