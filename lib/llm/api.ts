import { Message } from "@/components/chat-panel";
import { Task } from "@/lib/store";
import { StoreFunctionKeys } from "../dispatcher";

interface AIResponse {
  message: string;
}

export async function getAIResponse(
  input: string,
  tasks: Task[],
  history: Message[],
  onStream?: (chunk: string) => void,
  onAction?: (action: { type: StoreFunctionKeys; params: any }) => void
): Promise<AIResponse> {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input,
        tasks,
        history,
      }),
    });

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Response body is not readable");

    const decoder = new TextDecoder();
    let fullMessage = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "action") {
              onAction?.(data.content);
            } else if (data.type === "message") {
              onStream?.(data.content);
              fullMessage += data.content;
            }
          } catch (e) {
            console.warn("Failed to parse SSE:", e);
          }
        }
      }
    }

    return { message: fullMessage };
  } catch (error) {
    console.error("Error getting AI response:", error);
    throw error;
  }
}
