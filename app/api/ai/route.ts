import { chain } from "@/lib/llm/chatChain";
import { NextResponse } from "next/server";

// export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { input, todos, actions, history } = await request.json();

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    let fullMessage = "";
    let actionData = null;

    chain
      .stream({
        input,
        todos: JSON.stringify(todos),
        actions: JSON.stringify(actions),
        history: JSON.stringify(history),
      })
      .then(async (stream) => {
        try {
          for await (const chunk of stream) {
            fullMessage += chunk;
            await writer.write(
              encoder.encode(`data: ${JSON.stringify({
                type: "message",
                content: chunk,
              })}

`)
            );
          }

          const [messagePart, actionBlock] = fullMessage.split("===ACTION===");

          if (actionBlock?.includes("ACTION:")) {
            const [, actionStr] = actionBlock.trim().split("ACTION:");
            const [rawName, ...paramParts] = actionStr.split(":");
            const actionName = rawName.trim();
            const rawParams = paramParts.join(":").trim();

            try {
              actionData = {
                name: actionName,
                params: rawParams ? JSON.parse(rawParams) : {},
              };
            } catch (err) {
              console.warn("⚠️ 参数解析失败:", rawParams);
              actionData = { name: actionName, params: { raw: rawParams } };
            }

            await writer.write(
              encoder.encode(`data: ${JSON.stringify({
                type: "action",
                content: actionData,
              })}

`)
            );
          }

          await writer.close();
        } catch (error) {
          console.error("Stream processing error:", error);
          await writer.abort(error);
        }
      })
      .catch(async (error) => {
        console.error("Chain streaming error:", error);
        await writer.abort(error);
      });

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("❌ Error getting AI response:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
