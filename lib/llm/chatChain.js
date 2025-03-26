import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// Initialize the LLM
const llm = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0.7,
  timeout: 10000, // 10秒超时
});

// Create a prompt template for todo management
const todoPromptTemplate = new PromptTemplate({
  template: `You are a helpful AI assistant managing a todo list. Based on the user's input and current todo state, suggest appropriate actions.

Current todos: {todos}
Available actions: {actions}
User input: {input}

Provide a response in the following format:
1. A brief, friendly message (1-2 sentences)
2. The action to take (if any) in the format: ACTION:action_name:parameters

Response:`,
  inputVariables: ["todos", "actions", "input"],
});

// Create the chain
const chain = todoPromptTemplate.pipe(llm).pipe(new StringOutputParser());

export { chain };
