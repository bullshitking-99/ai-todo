import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { tool } from "@langchain/core/tools";
import { chatModel } from "../initialLLM";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ToolName } from "./type";

const createActionPrompt = new PromptTemplate({
  template: `
你是一个任务管理助手，请根据以下上下文返回一个 JSON 格式的操作指令：
任务列表：
{tasks}

Zustand Store 源码：
{storeCode}

用户请求：
{input}

请输出一个 JSON 对象，格式如下：
{{
  "type": storeCode 中定义的方法名,
  "params": type方法对应的参数，
}}

注意事项：
1. 仅返回 JSON 对象，不要包含其它说明文字。
2. 该对象需要可以在前端成功dispatch，所以
  a. 注意 params 和 对应方法所需参数类型的一致，不要捏造与storeCode中函数定义无关的type或params。
`,
  inputVariables: ["tasks", "storeCode", "input"],
});

const createActionChain = RunnableSequence.from([
  createActionPrompt,
  chatModel,
  new StringOutputParser(),
]);

export const createAction = tool(
  async (input: string, state: Record<string, any>) => {
    const action = await createActionChain.invoke({
      tasks: JSON.stringify(state.tasks),
      storeCode: state.storeCode,
      input,
    });
    return action;
  },
  {
    name: ToolName.createAction,
    // schema:{}, // 可以使用zod描述参数
    description:
      "根据用户请求、任务上下文tasks和zustand源代码storeCode，调用大模型生成前端可调用的结构化任务操作，参数为提炼后的任务操作描述，如：增加一个任务，标题为明天去买菜，描述为去菜市场买鸡蛋、牛奶、面包",
  }
);
