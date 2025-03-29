"use client";

import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import TaskItem from "./task-item";
import { Task, useTaskStore } from "@/lib/store";
import { useState } from "react";
import { dispatchAction, StoreFunctionKeys } from "@/lib/dispatcher";

export default function TaskPanel() {
  const { tasks } = useTaskStore();
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleTaskChange = (action: {
    type: StoreFunctionKeys;
    params: any;
  }) => {
    dispatchAction({
      ...action,
      callback: () => {
        // 这里可以添加AI反馈的回调逻辑
      },
    });
  };

  const addTask = () => {
    if (newTaskTitle.trim() === "") return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: "New task description",
      progress: 0,
      status: "normal",
    };

    handleTaskChange({
      type: "addTask",
      params: newTask,
    });
    setNewTaskTitle("");
  };

  return (
    <div className="w-full h-full border-r border-border p-6 overflow-hidden bg-background">
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

        <ScrollArea className="flex-1 h-0">
          <div className="space-y-4 pr-3">
            {tasks.map((task) => (
              <div key={task.id}>
                <TaskItem task={task} onTaskChange={handleTaskChange} />
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
