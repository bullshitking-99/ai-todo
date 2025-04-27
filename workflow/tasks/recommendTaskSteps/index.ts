import { chatModel } from "@/lib/llm/initialLLM";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { interrupt, task } from "@langchain/langgraph";
import { TaskStepsSchema } from "./schema";

const recommendStepsPrompt = new PromptTemplate({
  template: `
你是一个任务规划专家。请根据用户的复杂任务目标，为其拆解出 3-5 个清晰、可执行的子任务步骤。

用户诉求：
{standaloneQuestion}

注意事项：
1. 子任务应简洁明确，避免含糊或高度抽象。
2. 控制在 3 到 5 个步骤，每个步骤20字以内，保持精炼。
3. 所有步骤必须可以独立执行，具有明确的目标导向。
---
请以 **JSON** 格式返回，格式如下：
{{"steps":["子任务1","子任务2","子任务3"]}}
`,
  inputVariables: ["standaloneQuestion"],
});

// 加了这玩意儿约束输出，就还得在prompt里强调以JSON格式输出 ...
const taskStepsChatModel = chatModel.withStructuredOutput(TaskStepsSchema);

const recommendStepsChain = RunnableSequence.from([
  recommendStepsPrompt,
  taskStepsChatModel,
]);

export const recommendTaskSteps = task(
  "recommendTaskSteps",
  async (standaloneQuestion: string) => {
    const { steps } = await recommendStepsChain.invoke({ standaloneQuestion });

    // 中断一下，让用户确认步骤
    const confirmedSteps: string[] = interrupt({
      steps,
    });

    // 按 store 的格式来，后续可能需要扩展
    const _steps = confirmedSteps?.map((task) => ({
      content: task,
    }));
    return {
      steps: _steps,
    };
  }
);
