import { google } from "googleapis"
import type { Task } from "@/types/task"

// Google Calendar API setup
const SCOPES = ["https://www.googleapis.com/auth/calendar"]
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback"

// Create OAuth2 client
export const createOAuth2Client = (tokens?: any) => {
  const oAuth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI)

  if (tokens) {
    oAuth2Client.setCredentials(tokens)
  }

  return oAuth2Client
}

// Generate authentication URL
export const getAuthUrl = () => {
  const oAuth2Client = createOAuth2Client()
  return oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  })
}

// Exchange code for tokens
export const getTokens = async (code: string) => {
  const oAuth2Client = createOAuth2Client()
  const { tokens } = await oAuth2Client.getToken(code)
  return tokens
}

// Create a calendar event for a task
export const createCalendarEvent = async (task: Task, reminderMinutes: number, tokens: any) => {
  try {
    const oAuth2Client = createOAuth2Client(tokens)
    const calendar = google.calendar({ version: "v3", auth: oAuth2Client })

    if (!task.dueDate) {
      throw new Error("Task must have a due date to create a calendar event")
    }

    const dueDate = new Date(task.dueDate)

    // Create event
    const event = {
      summary: task.title,
      description: task.description || "",
      start: {
        dateTime: dueDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(dueDate.getTime() + 30 * 60000).toISOString(), // 30 minutes duration
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: reminderMinutes },
          { method: "popup", minutes: reminderMinutes },
        ],
      },
    }

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    })

    return response.data.id
  } catch (error) {
    console.error("Error creating calendar event:", error)
    throw error
  }
}

// Update a calendar event
export const updateCalendarEvent = async (eventId: string, task: Task, reminderMinutes: number, tokens: any) => {
  try {
    const oAuth2Client = createOAuth2Client(tokens)
    const calendar = google.calendar({ version: "v3", auth: oAuth2Client })

    if (!task.dueDate) {
      throw new Error("Task must have a due date to update a calendar event")
    }

    const dueDate = new Date(task.dueDate)

    // Update event
    const event = {
      summary: task.title,
      description: task.description || "",
      start: {
        dateTime: dueDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(dueDate.getTime() + 30 * 60000).toISOString(), // 30 minutes duration
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: reminderMinutes },
          { method: "popup", minutes: reminderMinutes },
        ],
      },
    }

    const response = await calendar.events.update({
      calendarId: "primary",
      eventId: eventId,
      requestBody: event,
    })

    return response.data.id
  } catch (error) {
    console.error("Error updating calendar event:", error)
    throw error
  }
}

// Delete a calendar event
export const deleteCalendarEvent = async (eventId: string, tokens: any) => {
  try {
    const oAuth2Client = createOAuth2Client(tokens)
    const calendar = google.calendar({ version: "v3", auth: oAuth2Client })

    await calendar.events.delete({
      calendarId: "primary",
      eventId: eventId,
    })

    return true
  } catch (error) {
    console.error("Error deleting calendar event:", error)
    throw error
  }
}

