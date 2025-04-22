import { chatModel } from "@/lib/llm/initialLLM";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { task } from "@langchain/langgraph";
import { SubTaskArraySchema } from "./schema";
import { createAction } from "../createAction";

const recommendStepsPrompt = new PromptTemplate({
  template: `
你是一个任务规划专家。请根据用户的复杂任务目标，为其拆解出 3-5 个清晰、可执行的子任务步骤。

任务目标：
{taskSummary}

注意事项：
1. 子任务应简洁明确，避免含糊或高度抽象。
2. 控制在 3 到 5 个步骤，避免拆分过碎。
4. 所有步骤必须可以独立执行，具有明确的目标导向。
`,
  inputVariables: ["taskSummary"],
});

const taskStepsChatModel = chatModel.withStructuredOutput(SubTaskArraySchema);

const recommendStepsChain = RunnableSequence.from([
  recommendStepsPrompt,
  taskStepsChatModel,
  // new StringOutputParser(),
]);

export const recommendTaskSteps = task(
  "recommend_task_steps",
  async (taskSummary: string) => {
    return await recommendStepsChain.invoke({ taskSummary });
  }
);
