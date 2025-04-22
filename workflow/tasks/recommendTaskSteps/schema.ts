import { z } from "zod";

const SubTaskSchema = z.object({
  content: z.string(),
});

export const SubTaskArraySchema = z.array(SubTaskSchema);
