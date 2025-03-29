import { create } from "zustand";

type TaskStatus = "normal" | "active" | "passive";

export interface Task {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: TaskStatus;
}

interface TaskStore {
  tasks: Task[];
  addTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  updateTask: (task: Task) => void;
  setTasks: (tasks: Task[]) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [
    {
      id: Date.now().toString(),
      title: "给我一个节奏",
      description: "人生就该有节奏，放肆的生活，让我来跳舞",
      progress: 30,
      status: "normal",
    },
  ],
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  deleteTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) })),
  updateTask: (updatedTask) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === updatedTask.id ? { ...updatedTask } : task
      ),
    })),
  setTasks: (tasks) => set({ tasks }),
}));
