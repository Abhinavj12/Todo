"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar, Edit, GripVertical, MoreVertical, Trash2, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import type { Task } from "@/types/task"
import { deleteTask, updateTaskStatus } from "@/lib/api"

interface TaskCardProps {
  task: Task
  onEdit: () => void
  onDelete: () => void
  onStatusChange: () => void
  onReminderClick?: (task: Task) => void
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange, onReminderClick }: TaskCardProps) {
  const { toast } = useToast()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/30"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800/30"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const handleStatusChange = async () => {
    try {
      setIsUpdating(true)
      await updateTaskStatus(task._id, !task.completed)
      onStatusChange()
      toast({
        title: task.completed ? "Task marked as incomplete" : "Task marked as complete",
        description: `"${task.title}" has been updated.`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update task",
        description: "There was an error updating the task status.",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteTask(task._id)
      onDelete()
      toast({
        title: "Task deleted",
        description: `"${task.title}" has been deleted.`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete task",
        description: "There was an error deleting the task.",
      })
    }
  }

  return (
    <Card className={`task-card border ${task.completed ? "opacity-70" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center h-6 mt-1">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
          </div>
          <Checkbox
            checked={task.completed}
            onCheckedChange={handleStatusChange}
            disabled={isUpdating}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </h3>
                <p className={`text-sm text-muted-foreground mt-1 ${task.completed ? "line-through" : ""}`}>
                  {task.description}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  {task.dueDate && onReminderClick && (
                    <DropdownMenuItem onClick={() => onReminderClick(task)}>
                      <Bell className="mr-2 h-4 w-4" />
                      Set Reminder
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className={`${getPriorityColor(task.priority)} border`}>
                {task.priority}
              </Badge>
              {task.dueDate && (
                <Badge variant="outline" className="flex items-center gap-1 border">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(task.dueDate), "MMM d, yyyy")}
                </Badge>
              )}
              {task.reminderSet && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800/30"
                >
                  <Bell className="h-3 w-3" />
                  Reminder Set
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task "{task.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

