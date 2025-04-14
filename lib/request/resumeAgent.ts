export async function resumeAgent({
  updatedValues,
  onStream,
}: {
  updatedValues?: Record<string, any>;
  onStream?: (chunk: any) => void;
}) {
  const res = await fetch("/api/resumeAgent", {
    method: "POST",
    body: JSON.stringify({
      updatedValues,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok || !res.body) {
    throw new Error("resumeAgent 请求失败");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";

    for (const part of parts) {
      if (part.startsWith("data:")) {
        const json = part.replace(/^data:\s*/, "");
        try {
          const parsed = JSON.parse(json);
          console.log("📥 Resume stream chunk:", parsed);
          onStream?.(parsed);
        } catch (err) {
          console.warn("❌ 无法解析 JSON:", json);
        }
      }

      if (part.startsWith("event: end")) {
        console.log("✅ resumeAgent stream 完成");
      }
    }
  }
}
