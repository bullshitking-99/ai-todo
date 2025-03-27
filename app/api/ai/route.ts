import { chain } from "@/lib/llm/chatChain";
import { NextResponse } from "next/server";

// export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { input, todos, actions } = await request.json();

    const response = await chain.invoke({
      input,
      todos: JSON.stringify(todos),
      actions: JSON.stringify(actions),
    });

    const [messagePart, actionBlock] = response.split("===ACTION===");

    const message = messagePart.trim();
    if (!actionBlock?.includes("ACTION:")) {
      return NextResponse.json({ message });
    }

    const [, actionStr] = actionBlock.trim().split("ACTION:");
    const [rawName, ...paramParts] = actionStr.split(":");
    const actionName = rawName.trim();
    const rawParams = paramParts.join(":").trim();

    let parsedParams = {};
    try {
      parsedParams = rawParams ? JSON.parse(rawParams) : {};
    } catch (err) {
      console.warn("⚠️ 参数解析失败:", rawParams);
      parsedParams = { raw: rawParams };
    }

    return NextResponse.json({
      message,
      action: {
        name: actionName,
        params: parsedParams,
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
