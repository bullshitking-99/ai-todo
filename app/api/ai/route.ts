import { chain } from "@/lib/llm/chatChain";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { input, todos, actions, history } = await request.json();

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    let buffer = "";
    let actionSent = false;

    chain
      .stream({
        input,
        todos: JSON.stringify(todos),
        actions: JSON.stringify(actions),
        history: JSON.stringify(history),
      })
      .then(async (llmStream) => {
        try {
          for await (const chunk of llmStream) {
            buffer += chunk;

            // 分隔符出现，表示 action + message 分界点
            const separatorIndex = buffer.indexOf("$");

            if (separatorIndex !== -1 && !actionSent) {
              const beforeDollar = buffer.slice(0, separatorIndex).trim();
              const afterDollar = buffer.slice(separatorIndex + 1); // message 后续

              // 提取并发送 action
              if (beforeDollar.startsWith("ACTION:")) {
                const [, actionStr] = beforeDollar.split("ACTION:");
                const [name, ...paramParts] = actionStr.split(":");
                const actionName = name.trim();
                const rawParams = paramParts.join(":").trim();

                try {
                  const actionData = {
                    name: actionName,
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
              buffer = afterDollar; // 清除 action 部分，只保留 message 开始部分
            }

            // 继续流式发送 message 内容
            if (actionSent && buffer) {
              await writer.write(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "message",
                    content: buffer,
                  })}\n\n`
                )
              );
              buffer = ""; // 清空已发送内容
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
