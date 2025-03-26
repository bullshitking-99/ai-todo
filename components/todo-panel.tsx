"use client";

import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import TaskItem from "./task-item";
import { Task, useTaskStore } from "@/lib/store";
import { useState } from "react";

export default function TodoPanel() {
  const { tasks, addTask: addTaskToStore } = useTaskStore();
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const addTask = () => {
    if (newTaskTitle.trim() === "") return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: "New task description",
      progress: 0,
      completed: false,
      status: "normal",
    };

    addTaskToStore(newTask);
    setNewTaskTitle("");
  };

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
            <div key={task.id}>
              <TaskItem task={task} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
