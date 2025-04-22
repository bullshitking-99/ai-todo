/**
 * 根据 storeCode 生成的llm输出格式
 * 未来可以用 Babel/TS AST 写个小工具自动遍历 TaskStore 类型，把函数参数提取出来映射成 Schema。
 */
import { z } from "zod";

// 定义基础类型
const SubTaskSchema = z.object({
  id: z.string(),
  content: z.string(),
  step: z.number(),
  finished: z.boolean(),
});

const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  progress: z.number(),
  status: z.enum(["normal", "active", "passive"]),
  subTasks: z
    .array(SubTaskSchema)
    .or(z.null())
    .transform((val) => val ?? []),
});

// 为每个方法构建一个类型联合体
const addTaskSchema = z.object({
  type: z.literal("addTask"),
  params: TaskSchema,
});

const deleteTaskSchema = z.object({
  type: z.literal("deleteTask"),
  params: z.object({
    id: z.string(),
  }),
});

const updateTaskSchema = z.object({
  type: z.literal("updateTask"),
  params: TaskSchema,
});

const setTasksSchema = z.object({
  type: z.literal("setTasks"),
  params: z.object({
    tasks: z.array(TaskSchema),
  }),
});

// 最终组合成 discriminatedUnion
export const taskStoreActionSchema = z.discriminatedUnion("type", [
  addTaskSchema,
  deleteTaskSchema,
  updateTaskSchema,
  setTasksSchema,
]);
