// /api/resumeAgent/route.ts
import { agent, ThreadId } from "@/lib/llm/agent";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { updatedValues } = await req.json();

  const config = {
    configurable: { thread_id: ThreadId },
  };

  // 可选：先 updateState
  if (updatedValues) {
    await agent.updateState(config, updatedValues);
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const agentStream = await agent.stream(null, {
        ...config,
      });

      for await (const chunk of agentStream) {
        if (chunk.agent?.messages) {
          for (const m of chunk.agent.messages) {
            if (m.content?.trim()) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "ai",
                    content: m.content,
                  })}\n\n`
                )
              );
            }
          }
        }

        if (chunk.tools?.messages) {
          for (const tm of chunk.tools.messages) {
            let parsed: any = tm.content;
            try {
              parsed = JSON.parse(tm.content);
            } catch {}
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "tool_result",
                  toolName: tm.name,
                  result: parsed,
                })}\n\n`
              )
            );
          }
        }
      }

      controller.enqueue(encoder.encode(`event: end\ndata: done\n\n`));
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
