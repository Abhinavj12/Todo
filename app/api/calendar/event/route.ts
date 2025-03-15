import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from "@/lib/google-calendar"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const tokensStr = cookieStore.get("google_tokens")?.value

    if (!tokensStr) {
      return NextResponse.json({ error: "Not authenticated with Google Calendar" }, { status: 401 })
    }

    const tokens = JSON.parse(tokensStr)
    const { task, reminderMinutes } = await request.json()

    const eventId = await createCalendarEvent(task, reminderMinutes, tokens)

    return NextResponse.json({ eventId })
  } catch (error) {
    console.error("Error creating calendar event:", error)
    return NextResponse.json({ error: "Failed to create calendar event" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const tokensStr = cookieStore.get("google_tokens")?.value

    if (!tokensStr) {
      return NextResponse.json({ error: "Not authenticated with Google Calendar" }, { status: 401 })
    }

    const tokens = JSON.parse(tokensStr)
    const { eventId, task, reminderMinutes } = await request.json()

    const updatedEventId = await updateCalendarEvent(eventId, task, reminderMinutes, tokens)

    return NextResponse.json({ eventId: updatedEventId })
  } catch (error) {
    console.error("Error updating calendar event:", error)
    return NextResponse.json({ error: "Failed to update calendar event" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const tokensStr = cookieStore.get("google_tokens")?.value

    if (!tokensStr) {
      return NextResponse.json({ error: "Not authenticated with Google Calendar" }, { status: 401 })
    }

    const tokens = JSON.parse(tokensStr)
    const { eventId } = await request.json()

    await deleteCalendarEvent(eventId, tokens)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting calendar event:", error)
    return NextResponse.json({ error: "Failed to delete calendar event" }, { status: 500 })
  }
}

