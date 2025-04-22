import { NextRequest } from "next/server";
import { HumanMessage } from "@langchain/core/messages";
import { loadFile } from "@/lib/server/loadFile";
import { agent, ThreadId } from "@/lib/llm/agent";
import { workflow, workflowConfig } from "@/workflow";

export async function POST(req: NextRequest) {
  const { input, tasks } = await req.json();
  const storeCode = await loadFile("gen/store.ts");

  for await (const item of await workflow.stream(
    {
      userInput: input,
      context: {
        storeCode,
        tasks,
      },
    },
    workflowConfig
  )) {
    console.log("stream chunk:", item);
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const agentStream = await agent.stream(
        { messages: [new HumanMessage(input)], tasks, storeCode },
        { configurable: { thread_id: ThreadId } }
      );

      for await (const chunk of agentStream) {
        // tool call
        if (chunk.agent?.messages) {
          for (const m of chunk.agent.messages) {
            if (m._getType() === "ai") {
              const toolCalls = m.tool_calls ?? [];
              for (const tool of toolCalls) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: "tool_call",
                      toolName: tool.name,
                      args: tool.args ?? {},
                    })}\n\n`
                  )
                );
              }

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
        }

        // tool result
        if (chunk.tools?.messages) {
          for (const tm of chunk.tools.messages) {
            if (tm._getType() === "tool") {
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
