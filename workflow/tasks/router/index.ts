import { chatModel } from "@/lib/llm/initialLLM";
import { task } from "@langchain/langgraph";
import { routeSchema } from "./schema";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Task } from "@/lib/store";

const routerPrompt = new PromptTemplate({
  template: `
你是 chat‑task 工作流中的第一个节点，需要根据上下文来判断下一个执行节点(nextStep) 以及
输出改写好的独立问题(standaloneQuestion)。以下信息对你决策至关重要，请务必遵守。

────────────────────────────────
### 工作流节点和他们之间的流转关系
1. **recommendTaskSteps**
   - 触发条件：用户任务 **复杂** 或 **意图模糊**，需要先拆分/规划步骤。
   - 输出：为当前任务生成一组可执行「步骤」。
   - **流转**：执行完毕后会自动进入 **createAction**。

2. **createAction**
   - 触发条件：用户意图明确，可直接生成固定的任务操作（如新增、修改、完成任务）。
   - 功能：根据用户/步骤信息执行实际任务操作。
   - **流转**：执行完毕后会自动进入 **resultFormatter**。

3. **resultFormatter**
   - 触发条件：用户意图与任务操作无关，或可以进一步询问时，直接生成答复。
   - 功能：生成最终反馈，结束对话。

> **总结**：有效路径有三条，怎么走取决于你给出的起点
>   • recommendTaskSteps → createAction → resultFormatter  
>   • createAction → resultFormatter
>   • resultFormatter

────────────────────────────────
### 需要考虑的上下文
- 用户原始消息: "{input}"
- 当前任务列表(JSON): {tasks}

仔细阅读后，按上述规则返回**唯一**合法 JSON；不要多输出任何解释。
`,
  inputVariables: ["input", "tasks"],
});

const routerChatModel = chatModel.withStructuredOutput(routeSchema);

const routerChain = RunnableSequence.from([
  routerPrompt,
  routerChatModel,
  // new StringOutputParser(),
]);

export const router = task("router", async (input: string, tasks: Task[]) => {
  const res = await routerChain.invoke({ input, tasks: JSON.stringify(tasks) });
  return res;
});
