import { z } from "zod";

// 用的 qianwen 模型，好像只能返回 JSON 格式，总是要包一个数组...
export const resultFormatterSchema = z.object({
  resultMessage: z
    .string()
    .describe("对用户输入和上游工作节点产出的总结性反馈"),
});
