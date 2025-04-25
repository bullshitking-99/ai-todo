import { Task } from "@/lib/store";
import { entrypoint, MemorySaver } from "@langchain/langgraph";
import { router } from "./tasks/router";
import { recommendTaskSteps } from "./tasks/recommendTaskSteps";
import { createAction } from "./tasks/createAction";
import { resultFormatter } from "./tasks/resultFormatter";

const ThreadId = "chat-conversation-123"; // 为每个用户生成一个唯一的 Thread_id

export const workflowConfig = {
  configurable: {
    thread_id: ThreadId,
  },
};

interface IContext {
  storeCode: string;
  tasks: Task[];
}

interface IInput {
  userInput: string;
  context: IContext;
}

export const workflow = entrypoint(
  { name: "chat-task", checkpointer: new MemorySaver() },
  async (input: IInput) => {
    const { userInput, context } = input;
    const { storeCode, tasks } = context;

    // 根据用户意图，获取任务起点
    const { nextStep, standaloneQuestion } = await router(userInput, tasks);

    let taskSteps, actions;

    if (nextStep === "recommendTaskSteps") {
      taskSteps = await recommendTaskSteps(standaloneQuestion);
    }

    if (nextStep === "recommendTaskSteps" || nextStep === "createAction") {
      actions = await createAction(userInput, storeCode, tasks, taskSteps);
    }

    const anwser = await resultFormatter(
      userInput,
      standaloneQuestion,
      actions,
      taskSteps
    );

    return anwser; // 可以不返回，但是最后还是会触发一次stream
  }
);
