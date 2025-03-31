import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { chatModel } from "@/lib/llm/initialLLM";
import { loadFile } from "@/lib/server/loadFile";

/**
 * 异步初始化所有可用的链
 */
export async function createChains() {
  const [chatPromptText, taskPromptText] = await Promise.all([
    loadFile("prompts/chatChain.txt"),
    loadFile("prompts/taskChain.txt"),
  ]);

  const ChatChainPrompt = new PromptTemplate({
    template: chatPromptText,
    inputVariables: ["tasks", "storeCode", "input", "history"],
  });

  const TaskChainPrompt = new PromptTemplate({
    template: taskPromptText,
    inputVariables: ["action", "tasks", "history", "storeCode"],
  });

  const chatChain = RunnableSequence.from([
    ChatChainPrompt,
    chatModel,
    new StringOutputParser(),
  ]);

  const taskChain = RunnableSequence.from([
    TaskChainPrompt,
    chatModel,
    new StringOutputParser(),
  ]);

  return { chatChain, taskChain };
}

const { chatChain, taskChain } = await createChains();

export { chatChain, taskChain };
