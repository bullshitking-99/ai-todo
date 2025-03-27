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
  history: Message[]
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

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error("Error getting AI response:", error);
    throw new Error("Failed to get AI response");
  }
}
