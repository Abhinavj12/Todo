import type { Task } from "@/types/task"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Helper function to handle API responses
async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || "An error occurred")
  }
  return response.json()
}

// Auth API calls
export async function register(name: string, email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
    credentials: "include",
  })
  return handleResponse(response)
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  })
  return handleResponse(response)
}

export async function logout() {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  })
  return handleResponse(response)
}

export async function getCurrentUser() {
  const response = await fetch(`${API_URL}/auth/me`, {
    credentials: "include",
  })
  return handleResponse(response)
}

// Task API calls
export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch(`${API_URL}/tasks`, {
    credentials: "include",
  })
  return handleResponse(response)
}

export async function createTask(taskData: Partial<Task>) {
  const response = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
    credentials: "include",
  })
  return handleResponse(response)
}

export async function updateTask(taskId: string, taskData: Partial<Task>) {
  const response = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
    credentials: "include",
  })
  return handleResponse(response)
}

export async function updateTaskStatus(taskId: string, completed: boolean) {
  const response = await fetch(`${API_URL}/tasks/${taskId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ completed }),
    credentials: "include",
  })
  return handleResponse(response)
}

export async function updateTaskPosition(taskId: string, position: number) {
  const response = await fetch(`${API_URL}/tasks/${taskId}/position`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ position }),
    credentials: "include",
  })
  return handleResponse(response)
}

export async function deleteTask(taskId: string) {
  const response = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: "DELETE",
    credentials: "include",
  })
  return handleResponse(response)
}

// Google Calendar integration
export async function getGoogleAuthUrl() {
  const response = await fetch("/api/auth/google")
  return handleResponse(response)
}

export async function createCalendarEvent(task: Task, reminderMinutes: number) {
  const response = await fetch("/api/calendar/event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ task, reminderMinutes }),
  })
  return handleResponse(response)
}

export async function updateCalendarEvent(eventId: string, task: Task, reminderMinutes: number) {
  const response = await fetch("/api/calendar/event", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ eventId, task, reminderMinutes }),
  })
  return handleResponse(response)
}

export async function deleteCalendarEvent(eventId: string) {
  const response = await fetch("/api/calendar/event", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ eventId }),
  })
  return handleResponse(response)
}

// Reminder API calls
export async function setTaskReminder(taskId: string, reminderMinutes: number) {
  const response = await fetch(`${API_URL}/tasks/${taskId}/reminder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reminderMinutes }),
    credentials: "include",
  })
  return handleResponse(response)
}

export async function removeTaskReminder(taskId: string) {
  const response = await fetch(`${API_URL}/tasks/${taskId}/reminder`, {
    method: "DELETE",
    credentials: "include",
  })
  return handleResponse(response)
}

