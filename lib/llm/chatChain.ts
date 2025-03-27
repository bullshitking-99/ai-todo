// lib/llm/chatChain.ts
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { chatModel } from "@/lib/llm/initialLLM"; // ✅ 引用共享实例
import { loadPrompt } from "../server/loadPrompt";

const template = loadPrompt("chatChain.txt");

const prompt = new PromptTemplate({
  template,
  inputVariables: ["todos", "actions", "input", "history"],
});

const chain = RunnableSequence.from([
  prompt,
  chatModel, // ✅ 使用共享模型实例
  new StringOutputParser(),
]);

export { chain };
