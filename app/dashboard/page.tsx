"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"
import DashboardHeader from "@/components/dashboard-header"
import TaskCard from "@/components/task-card"
import TaskForm from "@/components/task-form"
import ReminderDialog from "@/components/reminder-dialog"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, Filter, SortAsc, SortDesc } from "lucide-react"
import type { Task } from "@/types/task"
import { fetchTasks, updateTaskPosition } from "@/lib/api"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [reminderTask, setReminderTask] = useState<Task | null>(null)
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed">("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      loadTasks()
    }
  }, [isAuthenticated])

  const loadTasks = async () => {
    try {
      setIsLoading(true)
      const data = await fetchTasks()
      setTasks(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error loading tasks",
        description: "Failed to load your tasks. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const items = Array.from(tasks)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setTasks(items)

    try {
      await updateTaskPosition(reorderedItem._id, result.destination.index)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating task position",
        description: "Failed to update task position. Please try again.",
      })
      loadTasks() // Reload tasks to reset order
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  const handleTaskFormClose = () => {
    setShowTaskForm(false)
    setEditingTask(null)
  }

  const handleTaskSaved = () => {
    loadTasks()
    handleTaskFormClose()
  }

  const handleReminderClick = (task: Task) => {
    setReminderTask(task)
  }

  const handleReminderClose = () => {
    setReminderTask(null)
  }

  const handleReminderSet = () => {
    loadTasks()
    handleReminderClose()
  }

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus === "active") return !task.completed
    if (filterStatus === "completed") return task.completed
    return true
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.position - b.position
    } else {
      return b.position - a.position
    }
  })

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Tabs defaultValue="all" className="w-auto" onValueChange={(value) => setFilterStatus(value as any)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortOrder("asc")}>
                  <SortAsc className="h-4 w-4 mr-2" />
                  Oldest first
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("desc")}>
                  <SortDesc className="h-4 w-4 mr-2" />
                  Newest first
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={() => setShowTaskForm(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4 fade-in">
                  {sortedTasks.length === 0 ? (
                    <div className="text-center p-12 bg-card rounded-lg shadow-sm border">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No tasks found</h3>
                      <p className="text-muted-foreground mb-4">
                        {filterStatus === "all"
                          ? "You don't have any tasks yet. Create one to get started!"
                          : filterStatus === "active"
                            ? "No active tasks found. All your tasks are completed!"
                            : "No completed tasks found. Keep working on your active tasks!"}
                      </p>
                      <Button onClick={() => setShowTaskForm(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Your First Task
                      </Button>
                    </div>
                  ) : (
                    sortedTasks.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="slide-in"
                            style={{ ...provided.draggableProps.style }}
                          >
                            <TaskCard
                              task={task}
                              onEdit={() => handleEditTask(task)}
                              onDelete={loadTasks}
                              onStatusChange={loadTasks}
                              onReminderClick={handleReminderClick}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {showTaskForm && (
          <TaskForm isOpen={showTaskForm} onClose={handleTaskFormClose} onSaved={handleTaskSaved} task={editingTask} />
        )}

        {reminderTask && (
          <ReminderDialog
            isOpen={!!reminderTask}
            onClose={handleReminderClose}
            onReminderSet={handleReminderSet}
            task={reminderTask}
          />
        )}
      </main>
    </div>
  )
}

