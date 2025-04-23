import { z } from "zod";

// 定义单个子任务的 schema
const SubTaskSchema = z.string().describe("子任务的具体内容");

// 定义返回的整体结构，steps 是一个数组
export const TaskStepsSchema = z.object({
  steps: z.array(SubTaskSchema).describe("任务步骤的列表"),
});
