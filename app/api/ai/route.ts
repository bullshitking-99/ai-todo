import { chain } from "@/lib/llm/chatChain";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { input, todos, actions } = await request.json();

    const response = await chain.invoke({
      input,
      todos: JSON.stringify(todos),
      actions: actions.join(", "),
    });

    console.log("AI Response:", response);

    // Parse the response
    const lines = response.split("\n").filter(Boolean);
    const message = lines[0];
    const actionLine = lines[1];

    if (!actionLine?.startsWith("ACTION:")) {
      return NextResponse.json({ message });
    }

    // Parse action
    const [, actionStr] = actionLine.split("ACTION:");
    const [actionName, ...paramParts] = actionStr.split(":");
    const params = paramParts.join(":"); // Rejoin in case params contain colons

    return NextResponse.json({
      message,
      action: {
        name: actionName.trim(),
        params: params ? JSON.parse(params) : {},
      },
    });
  } catch (error) {
    console.error("Error getting AI response:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
