import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

const model = new ChatOpenAI({
  temperature: 0.7,
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 10000, // 加超时
  // 不要设置 streaming: true，如果你不打算流式消费
});

const prompt = new PromptTemplate({
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

const chain = RunnableSequence.from([prompt, model, new StringOutputParser()]);

export { chain };
