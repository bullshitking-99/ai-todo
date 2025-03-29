// lib/llm/chatChain.ts
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { chatModel } from "@/lib/llm/initialLLM"; // ✅ 引用共享实例
import { loadFile } from "../server/loadFile";

const ChatChainPrompt = new PromptTemplate({
  template: loadFile("prompts/chatChain.txt"),
  inputVariables: ["tasks", "storeCode", "input", "history"],
});

const chatChain = RunnableSequence.from([
  ChatChainPrompt,
  chatModel,
  new StringOutputParser(),
]);

export { chatChain };
