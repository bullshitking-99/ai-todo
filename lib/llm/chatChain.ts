// lib/llm/chatChain.ts
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { chatModel } from "@/lib/llm/initialLLM"; // ✅ 引用共享实例
import { loadFile } from "../server/loadFile";

const template = loadFile("prompts/chatChain.txt");

const prompt = new PromptTemplate({
  template,
  inputVariables: ["tasks", "storeCode", "input", "history"],
});

const chain = RunnableSequence.from([
  prompt,
  chatModel,
  new StringOutputParser(),
]);

export { chain };
