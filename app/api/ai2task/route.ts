import { chatChain } from "@/lib/llm/chains";
import { loadFile } from "@/lib/server/loadFile";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { input, tasks, history } = await request.json();

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    let buffer = "";
    let actionSent = false;

    chatChain
      .stream({
        input,
        tasks: JSON.stringify(tasks),
        history: JSON.stringify(history),
        storeCode: loadFile("lib/store.ts"),
      })
      .then(async (llmStream) => {
        try {
          for await (const chunk of llmStream) {
            buffer += chunk;

            const separatorIndex = buffer.indexOf("$");

            if (separatorIndex !== -1 && !actionSent) {
              const beforeDollar = buffer.slice(0, separatorIndex).trim();
              const afterDollar = buffer.slice(separatorIndex + 1);

              if (beforeDollar.startsWith("ACTION:")) {
                const [, actionStr] = beforeDollar.split("ACTION:");
                const [name, ...paramParts] = actionStr.split(":");
                const actionName = name.trim();
                const rawParams = paramParts.join(":").trim();

                try {
                  const actionData = {
                    type: actionName,
                    params: rawParams ? JSON.parse(rawParams) : {},
                  };

                  await writer.write(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        type: "action",
                        content: actionData,
                      })}\n\n`
                    )
                  );
                } catch (e) {
                  console.warn("⚠️ Failed to parse action JSON:", rawParams);
                }
              }

              actionSent = true;
              buffer = afterDollar;
            }

            if (actionSent && buffer) {
              await writer.write(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "message",
                    content: buffer,
                  })}\n\n`
                )
              );
              buffer = "";
            }
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
