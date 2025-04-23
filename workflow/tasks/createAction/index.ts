import { chatModel } from "@/lib/llm/initialLLM";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { task } from "@langchain/langgraph";
import { taskStoreActionSchema } from "./schema";
import { Task } from "@/lib/store";

const createActionPrompt = new PromptTemplate({
  template: `
你是一个任务管理助手，根据上下文生成一个 JSON 指令对象，用于前端任务管理系统的 dispatch 操作。

上下文信息如下：

- 当前存在的任务列表：
{tasks}

- Zustand Store 源码（包含可用方法与参数）：
{storeCode}

- 用户输入的请求：
{input}

请严格遵循以下格式和要求生成输出：

1. 仅返回一个**JSON 对象**，不要包含其它说明文字。
2. 输出格式固定为：
   {{
     "type": storeCode 中定义的方法名，
     "params": 对应方法的参数（注意是**扁平结构**，不要额外嵌套层级）
   }}
`,
  inputVariables: ["tasks", "storeCode", "input"],
});

const createActionChatModel = chatModel.withStructuredOutput(
  taskStoreActionSchema
);

const createActionChain = RunnableSequence.from([
  createActionPrompt,
  createActionChatModel,
  // new StringOutputParser(), // 有了withStructuredOutput就不需要这个了
]);

export const createAction = task(
  "create_action",
  async (
    input: string,
    storeCode: string,
    tasks: Task[],
    taskSteps?: Record<string, any>
  ) => {
    const action = await createActionChain.invoke({
      tasks: JSON.stringify(tasks),
      storeCode: storeCode,
      input,
      // taskSteps: JSON.stringify(taskSteps?.steps || []), // 嵌套结构太深，会导致LLM出错
    });

    // 手动填充subTask，避免频繁的LLM格式出错
    let _action;
    if (action.type === "addTask" || action.type === "updateTask") {
      _action = {
        ...action,
        params: {
          ...action.params,
          subTask: taskSteps?.steps || [],
        },
      };
    } else {
      _action = action;
    }

    return _action;
  }
);
