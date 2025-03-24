"use client"

import { useState } from "react"
import { Pencil, Trash2, CheckCircle, MoreHorizontal, X, Save } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

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

interface TaskItemProps {
  task: Task
  onDelete: (id: string) => void
  onComplete: (id: string) => void
  onUpdate: (task: Task) => void
  onStatusChange: (id: string, status: TaskStatus) => void
}

export default function TaskItem({ task, onDelete, onComplete, onUpdate, onStatusChange }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(task.title)
  const [editedDescription, setEditedDescription] = useState(task.description)
  const [editedProgress, setEditedProgress] = useState(task.progress)

  const handleSave = () => {
    onUpdate({
      ...task,
      title: editedTitle,
      description: editedDescription,
      progress: editedProgress,
      // Status remains unchanged during edits
      status: task.status,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedTitle(task.title)
    setEditedDescription(task.description)
    setEditedProgress(task.progress)
    setIsEditing(false)
  }

  // Determine card styling based on status
  const getCardClasses = () => {
    switch (task.status) {
      case "active":
        return "border-primary border-2 shadow-md"
      case "passive":
        return "opacity-60"
      default:
        return ""
    }
  }

  return (
    <Card className={`p-4 transition-all hover:shadow-md ${getCardClasses()}`}>
      {isEditing ? (
        // Edit mode
        <div className="space-y-3">
          <Input value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} className="font-medium" />
          <Textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="text-sm resize-none h-20"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs">Progress: {editedProgress}%</span>
            <input
              type="range"
              min="0"
              max="100"
              value={editedProgress}
              onChange={(e) => setEditedProgress(Number.parseInt(e.target.value))}
              className="flex-1"
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
          </div>
        </div>
      ) : (
        // View mode
        <>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium text-foreground">{task.title}</h3>
              <p className="text-sm text-muted-foreground">{task.description}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Task options</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onComplete(task.id)}
                  disabled={task.completed}
                  className="text-success"
                >
                  <CheckCircle className="h-4 w-4 mr-2" /> Complete
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(task.id, "active")} disabled={task.status === "active"}>
                  Set Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(task.id, "normal")} disabled={task.status === "normal"}>
                  Set Normal
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onStatusChange(task.id, "passive")}
                  disabled={task.status === "passive"}
                >
                  Set Passive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-1 text-xs">
              <span>Progress</span>
              <span>{task.progress}%</span>
            </div>
            <Progress value={task.progress} className="h-2" indicatorClassName={task.completed ? "bg-success" : ""} />
          </div>

          {task.completed && (
            <div className="flex items-center mt-2 text-xs text-success">
              <CheckCircle className="h-3 w-3 mr-1" />
              <span>Completed</span>
            </div>
          )}
        </>
      )}
    </Card>
  )
}

