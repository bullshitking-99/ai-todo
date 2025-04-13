import { Task } from "../store";

export async function chatWithAgent({
  input,
  tasks,
  onStream,
  controller, // 用于中断请求
}: {
  input: string;
  tasks: Task[];
  onStream?: (chunk: any) => void;
  controller?: AbortController;
}) {
  const res = await fetch("/api/chatWithAgent", {
    method: "POST",
    body: JSON.stringify({
      input,
      tasks,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    signal: controller?.signal,
  });

  if (!res.ok || !res.body) {
    throw new Error("请求失败");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // 拆解成 event stream 格式（按行 \n\n）
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";

    for (const part of parts) {
      if (part.startsWith("data:")) {
        const json = part.replace(/^data:\s*/, "");
        try {
          const parsed = JSON.parse(json);
          // console.log("📥 Agent stream chunk:", parsed);

          onStream?.(parsed);
        } catch (err) {
          console.warn("❌ 无法解析 JSON:", json);
        }
      }

      // 可监听结束事件
      if (part.startsWith("event: end")) {
        // console.log("✅ agent stream 完成");
      }
    }
  }
}
