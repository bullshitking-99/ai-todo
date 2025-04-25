import { chatModel } from "@/lib/llm/initialLLM";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { task } from "@langchain/langgraph";
import { TaskStepsSchema } from "./schema";

const recommendStepsPrompt = new PromptTemplate({
  template: `
你是一个任务规划专家。请根据用户的复杂任务目标，为其拆解出 3-5 个清晰、可执行的子任务步骤。

用户诉求：
{standaloneQuestion}

注意事项：
1. 子任务应简洁明确，避免含糊或高度抽象。
2. 控制在 3 到 5 个步骤，避免拆分过碎。
3. 所有步骤必须可以独立执行，具有明确的目标导向。

`,
  inputVariables: ["standaloneQuestion"],
});

const taskStepsChatModel = chatModel.withStructuredOutput(TaskStepsSchema);

const recommendStepsChain = RunnableSequence.from([
  recommendStepsPrompt,
  taskStepsChatModel,
]);

export const recommendTaskSteps = task(
  "recommendTaskSteps",
  async (standaloneQuestion: string) => {
    const { steps } = await recommendStepsChain.invoke({ standaloneQuestion });
    // 按 store 的格式来，后续可能需要扩展
    const _steps = steps?.map((task) => ({
      content: task,
    }));
    return {
      steps: _steps,
    };
  }
);
