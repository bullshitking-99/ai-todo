import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { tool } from "@langchain/core/tools";
import { chatModel } from "../initialLLM";
import { StringOutputParser } from "@langchain/core/output_parsers";

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
  "params": 方法参数，注意task中的必填属性要完整，不要只传入部分属性，
}}
仅返回 JSON，不要包含其它说明文字。
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
    name: "createAction",
    description:
      "根据用户请求、任务上下文tasks和zustand源代码storeCode，调用大模型生成前端可调用的结构化任务操作，参数为提炼后的任务操作描述，如：增加一个任务，标题为明天去买菜，描述为去菜市场买鸡蛋、牛奶、面包",
  }
);
