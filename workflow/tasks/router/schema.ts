import { z } from "zod";

const taskList = [
  "createAction",
  "resultFormatter",
  "recommendTaskSteps",
] as const;

export const routeSchema = z.object({
  nextStep: z.enum(taskList).describe("The next step in the routing process"),
  standaloneQuestion: z
    .string()
    .describe("The standalone question of user input and context"),
});
