import { chatModel } from "@/lib/llm/initialLLM";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { task } from "@langchain/langgraph";
import { resultFormatterSchema } from "./schema";

const resultFormatterPrompt = new PromptTemplate({
  template: `
  你是一个任务管理助手，负责根据用户的输入和上游工作节点的产出进行总结性的反馈；
  ---
  你的上游已经有两个工作节点，他们负责产出推荐的任务步骤和在前端修改任务状态的指令:
  推荐的任务步骤：
  {recommendTaskSteps}
  前端修改任务状态的指令：
  {taskAction}
  当用户的任务比较简单时，以上工作节点的产出可能为空，这是正常情况；
  ---
  还有两个你可以参考的上下文：
  用户输入的请求：
  {input}
  根据对话记忆总结的standalone question：
  {standaloneQuestion}
  ---
  根据这些上下文，生成一个友好、亲和、鼓励、简短的总结性反馈（不需要包含任务步骤和指令，这些只是作为参考），带一些emoji就更好了：
`,
  inputVariables: [
    "input",
    "standaloneQuestion",
    "recommendTaskSteps",
    "taskAction",
  ],
});

// const resultFormatterModel = chatModel.withStructuredOutput(
//   resultFormatterSchema
// );

const resultFormatterChain = RunnableSequence.from([
  resultFormatterPrompt,
  // resultFormatterModel, // 使用约束之后还要在prompt声明...，不如直接使用解析出来的content
  chatModel,
]);

export const resultFormatter = task(
  "resultFormatter",
  async (
    input: string,
    standaloneQuestion: string,
    recommendTaskSteps = "",
    taskAction = ""
  ) => {
    const { content } = await resultFormatterChain.invoke({
      input,
      standaloneQuestion,
      recommendTaskSteps,
      taskAction,
    });

    return { content };
  }
);
