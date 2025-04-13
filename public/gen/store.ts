import { create } from "zustand";

type TaskStatus = "normal" | "active" | "passive";

export interface Task {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: TaskStatus;
  subTasks: SubTask[];
}

export interface SubTask {
  id: string;
  content: string;
  step: number;
  finished: boolean;
}

export interface TaskStore {
  tasks: Task[];
  addTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  updateTask: (task: Task) => void;
  setTasks: (tasks: Task[]) => void;
}

// 为任务属性补全初始值，避免llm返回残缺数据导致报错
const createInitialTask = (): Task => ({
  id: Date.now().toString(),
  title: "",
  description: "",
  progress: 0,
  status: "normal",
  subTasks: [],
});

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [
    {
      id: Date.now().toString(),
      title: "给我一个节奏",
      description: "人生就该有节奏，放肆的生活，让我来跳舞",
      progress: 50,
      status: "normal",
      subTasks: [
        {
          id: "1-1",
          content: "Create color palette",
          step: 25,
          finished: true,
        },
        {
          id: "1-2",
          content: "Design component library",
          step: 25,
          finished: true,
        },
        {
          id: "1-3",
          content: "Implement components",
          step: 25,
          finished: false,
        },
        {
          id: "1-4",
          content: "Document usage guidelines",
          step: 25,
          finished: false,
        },
      ],
    },
  ],
  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, { ...createInitialTask(), ...task }],
    })),
  deleteTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) })),
  updateTask: (updatedTask) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === updatedTask.id
          ? { ...createInitialTask(), ...updatedTask }
          : task
      ),
    })),
  setTasks: (tasks) =>
    set({ tasks: tasks.map((t) => ({ ...createInitialTask(), ...t })) }),
}));
