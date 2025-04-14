import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { tool } from "@langchain/core/tools";
import { chatModel } from "../initialLLM";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ToolName } from "./type";

const recommendStepsPrompt = new PromptTemplate({
  template: `
你是一个任务规划专家。请根据用户的复杂任务目标，为其拆解出 3-5 个清晰、可执行的子任务步骤。

任务目标：
{taskSummary}

请仅输出一个 JSON 数组，格式如下：
[
  {{ "content": "子任务 1" }},
  {{ "content": "子任务 2" }},
  ...
]

注意事项：
1. 子任务应简洁明确，避免含糊或高度抽象。
2. 控制在 3 到 5 个步骤，避免拆分过碎。
3. 仅返回纯 JSON，不能包含任何解释或额外文字。
4. 所有步骤必须可以独立执行，具有明确的目标导向。
`,
  inputVariables: ["taskSummary"],
});

const recommendStepsChain = RunnableSequence.from([
  recommendStepsPrompt,
  chatModel,
  new StringOutputParser(),
]);

export const recommendTaskSteps = tool(
  async (taskSummary: string) => {
    return await recommendStepsChain.invoke({ taskSummary });
  },
  {
    name: ToolName.recommendTaskSteps,
    description: `
根据用户的任务目标描述（taskSummary），推荐 3~5 个精炼的子任务，输出格式如下：

[
  { "content": "子任务 1" },
  { "content": "子任务 2" },
  ...
]

注意：
- 输入是 agent 综合推理后的任务目标（非用户原始输入）；
- 输出结构适用于前端渲染任务步骤编辑器。
`.trim(),
  }
);
