export interface Task {
  _id: string
  title: string
  description?: string
  completed: boolean
  priority: string
  dueDate?: string
  position: number
  userId: string
  createdAt: string
  updatedAt: string
  reminderSet?: boolean
  reminderTime?: string
  googleEventId?: string
}

