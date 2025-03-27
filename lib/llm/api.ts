import { Message } from "@/components/chat-panel";
import { Task } from "@/lib/store";

interface AIResponse {
  message: string;
  action?: {
    name: string;
    params: any;
  };
}

export async function getAIResponse(
  input: string,
  todos: Task[],
  actions: Record<string, string>,
  history: Message[],
  onStream?: (chunk: string) => void
): Promise<AIResponse> {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input,
        todos,
        actions: Object.entries(actions),
        history,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }

    let fullMessage = "";
    let actionData = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = new TextDecoder().decode(value);
      const lines = text.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "message") {
              fullMessage += data.content;
              onStream?.(data.content);
            } else if (data.type === "action") {
              actionData = data.content;
            }
          } catch (e) {
            console.warn("Failed to parse SSE data:", e);
          }
        }
      }
    }

    return {
      message: fullMessage,
      action: actionData,
    };
  } catch (error) {
    console.error("Error getting AI response:", error);
    throw new Error("Failed to get AI response");
  }
}
