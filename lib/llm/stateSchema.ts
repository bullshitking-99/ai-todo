import { Annotation } from "@langchain/langgraph";
import { type BaseMessage } from "@langchain/core/messages";

// ✅ 定义类型（可复用你的 Zustand 类型）
export const ChatTaskState = Annotation.Root({
  storeCode: Annotation<string>,
  tasks: Annotation<
    {
      id: string;
      title: string;
      description: string;
      progress: number;
      status: "normal" | "active" | "passive";
      subTasks: {
        id: string;
        content: string;
        step: number;
        finished: boolean;
      }[];
    }[]
  >,
  messages: Annotation<BaseMessage[]>({
    default: () => [],
    reducer: (prev, next) => prev.concat(next),
  }),
});
