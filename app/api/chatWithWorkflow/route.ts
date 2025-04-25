import { NextRequest } from "next/server";
import { workflow, workflowConfig } from "@/workflow";
import { loadFile } from "@/lib/server/loadFile";

export async function POST(req: NextRequest) {
  const { input, tasks } = await req.json();
  const storeCode = await loadFile("gen/store.ts");

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const stream = await workflow.stream(
        {
          userInput: input,
          context: { storeCode, tasks },
        },
        workflowConfig // 持久化-短期记忆
      );

      // 开始流式传输
      for await (const chunk of stream) {
        const [task, result] = Object.entries(chunk)[0];

        // 在当前工作流中属于重复输出，而且还和上一个输出在同一个chunk里
        if (task === "chat-task") {
          break;
        }

        const data = {
          task,
          result,
        };
        controller.enqueue(encoder.encode(JSON.stringify(data)));
      }

      // 结束流式传输
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
