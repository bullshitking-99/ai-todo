"use client"

import { useState } from "react"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import TaskItem from "./task-item"

// Task type definition
type TaskStatus = "normal" | "active" | "passive"

interface Task {
  id: string
  title: string
  description: string
  progress: number
  completed: boolean
  status: TaskStatus
}

export default function TodoPanel() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Design System",
      description: "Create a consistent design system for the application",
      progress: 75,
      completed: false,
      status: "active",
    },
    {
      id: "2",
      title: "User Authentication",
      description: "Implement login and registration functionality",
      progress: 100,
      completed: true,
      status: "passive",
    },
    {
      id: "3",
      title: "Dashboard Layout",
      description: "Design and implement the main dashboard layout",
      progress: 40,
      completed: false,
      status: "normal",
    },
    {
      id: "4",
      title: "API Integration",
      description: "Connect frontend with backend API endpoints",
      progress: 20,
      completed: false,
      status: "normal",
    },
  ])

  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [taskToRemove, setTaskToRemove] = useState<string | null>(null)

  const addTask = () => {
    if (newTaskTitle.trim() === "") return

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: "New task description",
      progress: 0,
      completed: false,
      status: "normal",
    }

    setTasks([...tasks, newTask])
    setNewTaskTitle("")
  }

  const deleteTask = (id: string) => {
    // Mark the task for removal animation
    setTaskToRemove(id)

    // Remove after animation completes
    setTimeout(() => {
      setTasks(tasks.filter((task) => task.id !== id))
      setTaskToRemove(null)
    }, 500) // Match this with CSS transition duration
  }

  const completeTask = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: true, progress: 100 } : task)))
  }

  const updateTask = (updatedTask: Task) => {
    // Ensure completed status matches progress
    const isCompleted = updatedTask.progress === 100

    setTasks(
      tasks.map((task) =>
        task.id === updatedTask.id
          ? {
              ...updatedTask,
              completed: isCompleted,
            }
          : task,
      ),
    )
  }

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, status } : task)))
  }

  return (
    <div className="w-1/2 border-r border-border p-6 overflow-y-auto bg-background">
      <div className="flex flex-col h-full">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Tasks</h1>
        </div>

        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1"
          />
          <Button onClick={addTask} className="bg-primary hover:bg-primary/90">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        <Separator className="mb-6" />

        <div className="space-y-4 flex-1 overflow-y-auto">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`task-container ${task.id === taskToRemove ? "task-removing" : "task-visible"}`}
            >
              <TaskItem
                task={task}
                onDelete={deleteTask}
                onComplete={completeTask}
                onUpdate={updateTask}
                onStatusChange={updateTaskStatus}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

