import { create } from "zustand";

type TaskStatus = "normal" | "active" | "passive";

export interface Task {
  id: string;
  title: string;
  description: string;
  progress: number;
  completed: boolean;
  status: TaskStatus;
}

interface TaskStore {
  tasks: Task[];
  addTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  updateTask: (task: Task) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [
    {
      id: "0",
      title: "Design System",
      description: "Create a consistent design system for the application",
      progress: 75,
      completed: false,
      status: "active",
    },
  ],
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  deleteTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) })),
  completeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, completed: true, progress: 100 } : task
      ),
    })),
  updateTask: (updatedTask) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === updatedTask.id
          ? { ...updatedTask, completed: updatedTask.progress === 100 }
          : task
      ),
    })),
  updateTaskStatus: (id, status) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, status } : task
      ),
    })),
}));
