import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { chatModel } from "./initialLLM";
import { ChatTaskState } from "./stateSchema";
import {
  LangGraphRunnableConfig,
  MemorySaver,
  MessagesAnnotation,
} from "@langchain/langgraph";
import { BaseMessageLike } from "@langchain/core/messages";
import { createAction } from "./tools/createAction";
import { recommendTaskSteps } from "./tools/recommendTaskSteps";

type Prompt = (
  state: typeof MessagesAnnotation.State,
  config: LangGraphRunnableConfig
) => BaseMessageLike[];

const prompt = (
  state: (typeof ChatTaskState)["State"],
  _config: LangGraphRunnableConfig
) => {
  const systemMessage = `
你是一个智能任务助手，帮助用户理解、拆解、修改和管理任务，并可以调用工具协助执行操作。

系统会提供如下上下文数据，你需要充分利用它们来理解当前任务状态，并做出合理的回复或建议：

【上下文字段说明】
- tasks: ${JSON.stringify(state.tasks)}
    当前所有任务列表。

【你的目标】
- 结合当前任务列表，了解用户的意图和需求。
- 回应用户的请求：如CRUD任务、对任务进行优先级排序，或是先推荐一些任务步骤等
- 回答前，可以查看是否有可调用的工具（Tool），来辅助得到更精确和完善的回答

请根据当前上下文进行推理与回复，不要虚构不存在的信息。若缺少关键数据，可引导用户补充。
`;

  return [
    { role: "system", content: systemMessage },
    ...(state.messages ?? []),
  ];
};

const agentCheckpointer = new MemorySaver();
const ThreadId = "user-123";

const agent = createReactAgent({
  llm: chatModel,
  tools: [createAction, recommendTaskSteps],
  interruptAfter: ["tools"],
  stateSchema: ChatTaskState,
  prompt: prompt as Prompt,
  checkpointSaver: agentCheckpointer,
});

export { agent, ThreadId };
