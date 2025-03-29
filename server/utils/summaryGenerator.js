import dotenv from 'dotenv';
dotenv.config();

import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";

// Initialize the OpenAI LLM instance.
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const llm = new ChatOpenAI({
  openAIApiKey: OPENAI_API_KEY,
  model: "gpt-4o-mini", // Ensure this model name is correct and available
  temperature: 0,
});

// Define the summarization prompt using chat messages
const prompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(
    "You are a helpful assistant that summarizes the provided text into a concise summary. Act as a QA Analyst."
  ),
  HumanMessagePromptTemplate.fromTemplate(
    `Analyze the requirements text provided below and concisely extract the following information using clear Markdown formatting:

Requirements Text:

{text}

*Extract:*
1.  *Key Functional Modules:* (List the main areas/features)
2.  *User Stories & Acceptance Criteria (AC):*
    *   *Story:* [Format: As a <user type>, I want <goal> so that <benefit>]
        *   *AC:* [Format: Given <context>, When <action>, Then <outcome>]
        *   *AC:* ...
    *   *Story:* ...
        *   *AC:* ...
3.  *Potential Edge Cases / Error Conditions:* (List specific scenarios)`
  ),
]);

// Create the chain by piping the prompt to the LLM
const summarizationChain = prompt.pipe(llm);

/**
 * Summarize the provided text.
 * @param {string} text - The text to summarize.
 * @returns {Promise<string>} - The generated summary.
 */
export async function summarizeText(text) {
  const response = await summarizationChain.invoke({ text });
  return response.content;
}
