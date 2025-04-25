import { Task } from "../store";

enum taskNameList {
  "router",
  "createAction",
  "recommendTaskSteps",
  "resultFormatter",
}

export interface IWorkFlowChunk {
  task: keyof typeof taskNameList;
  result: Record<string, any>;
}

export async function chatWithWorkflow({
  input,
  tasks,
  onStream,
  controller, // 用于中断请求
}: {
  input: string;
  tasks: Task[];
  onStream: (chunk: IWorkFlowChunk) => void;
  controller?: AbortController;
}) {
  const res = await fetch("/api/chatWithWorkflow", {
    method: "POST",
    body: JSON.stringify({
      input,
      tasks,
    }),
    signal: controller?.signal, // 前端主动中断请求
  });

  const reader = res.body?.getReader();
  const decoder = new TextDecoder("utf-8");

  if (!reader) return;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunkString = decoder.decode(value);

    try {
      const chunk: IWorkFlowChunk = JSON.parse(chunkString);
      onStream(chunk);
    } catch (error) {
      console.error("chunk parse error:", error, chunkString);
    }
  }
}
