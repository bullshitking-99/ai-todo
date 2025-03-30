import { NextResponse } from "next/server";
import { taskChain } from "@/lib/llm/chains";
import storeCode from "@/lib/storeCode";

export async function POST(req: Request) {
  const { action, tasks, history } = await req.json();

  try {
    const stream = await taskChain.stream({
      action,
      tasks,
      history,
      storeCode,
    });

    const responseStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        for await (const chunk of stream) {
          // 每个 chunk 单独返回，不累加
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ message: chunk })}\n\n`)
          );
        }

        controller.enqueue(encoder.encode(`[DONE]\n\n`));
        controller.close();
      },
    });

    return new NextResponse(responseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[TASK2AI_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
