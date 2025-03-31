import { NextResponse } from "next/server";
import { createChains } from "@/lib/llm/chains";
import { loadFile } from "@/lib/server/loadFile";

// export const runtime = "nodejs";

export async function POST(req: Request) {
  const { taskChain } = await createChains();
  const storeCode = await loadFile("gen/store.ts");

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
