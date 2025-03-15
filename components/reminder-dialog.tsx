"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Calendar, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import type { Task } from "@/types/task"
import { setTaskReminder, removeTaskReminder, getGoogleAuthUrl, createCalendarEvent } from "@/lib/api"

interface ReminderDialogProps {
  isOpen: boolean
  onClose: () => void
  onReminderSet: () => void
  task: Task
}

export default function ReminderDialog({ isOpen, onClose, onReminderSet, task }: ReminderDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [reminderMinutes, setReminderMinutes] = useState("30")
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false)
  const [isSettingReminder, setIsSettingReminder] = useState(false)
  const [isRemovingReminder, setIsRemovingReminder] = useState(false)

  const handleSetReminder = async () => {
    try {
      setIsSettingReminder(true)

      // First set the reminder in our database
      await setTaskReminder(task._id, Number.parseInt(reminderMinutes))

      // Then try to create a Google Calendar event
      try {
        const { eventId } = await createCalendarEvent(task, Number.parseInt(reminderMinutes))

        toast({
          title: "Reminder set with Google Calendar",
          description: `You'll be reminded ${reminderMinutes} minutes before the task is due.`,
        })
      } catch (error) {
        // If Google Calendar fails, we still have the reminder in our database
        toast({
          title: "Reminder set",
          description: `You'll be reminded ${reminderMinutes} minutes before the task is due. Google Calendar integration failed.`,
        })
      }

      onReminderSet()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to set reminder",
        description: "There was an error setting the reminder. Please try again.",
      })
    } finally {
      setIsSettingReminder(false)
    }
  }

  const handleRemoveReminder = async () => {
    try {
      setIsRemovingReminder(true)
      await removeTaskReminder(task._id)

      toast({
        title: "Reminder removed",
        description: "The reminder has been removed successfully.",
      })

      onReminderSet()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to remove reminder",
        description: "There was an error removing the reminder. Please try again.",
      })
    } finally {
      setIsRemovingReminder(false)
    }
  }

  const handleConnectGoogle = async () => {
    try {
      setIsConnectingGoogle(true)
      const { authUrl } = await getGoogleAuthUrl()
      window.location.href = authUrl
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to connect to Google",
        description: "There was an error connecting to Google Calendar. Please try again.",
      })
      setIsConnectingGoogle(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {task.reminderSet ? "Manage Reminder" : "Set Reminder"}
          </DialogTitle>
          <DialogDescription>
            {task.reminderSet
              ? "Modify or remove the reminder for this task."
              : "Set a reminder for this task to receive notifications before it's due."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span>Due: {new Date(task.dueDate!).toLocaleDateString()}</span>
          </div>

          {!task.reminderSet ? (
            <div className="grid grid-cols-2 items-center gap-4">
              <label htmlFor="reminderTime" className="text-sm font-medium">
                Remind me before:
              </label>
              <Select value={reminderMinutes} onValueChange={setReminderMinutes}>
                <SelectTrigger id="reminderTime">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="1440">1 day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">You currently have a reminder set for this task.</div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ExternalLink className="h-4 w-4" />
            <span>Reminders will be synced with Google Calendar if connected.</span>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {task.reminderSet ? (
            <>
              <Button variant="destructive" onClick={handleRemoveReminder} disabled={isRemovingReminder}>
                {isRemovingReminder ? "Removing..." : "Remove Reminder"}
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleConnectGoogle} disabled={isConnectingGoogle}>
                {isConnectingGoogle ? "Connecting..." : "Connect Google Calendar"}
              </Button>
              <Button onClick={handleSetReminder} disabled={isSettingReminder}>
                {isSettingReminder ? "Setting..." : "Set Reminder"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

