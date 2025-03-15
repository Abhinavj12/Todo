import express from "express"
import {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskPosition,
  setTaskReminder,
  removeTaskReminder,
  updateGoogleEventId,
} from "../controllers/taskController.js"
import { protect } from "../middleware/auth.js"

const router = express.Router()

// Apply auth middleware to all routes
router.use(protect)

router.route("/").get(getTasks).post(createTask)

router.route("/:id").get(getTask).put(updateTask).delete(deleteTask)

router.patch("/:id/status", updateTaskStatus)
router.patch("/:id/position", updateTaskPosition)
router.post("/:id/reminder", setTaskReminder)
router.delete("/:id/reminder", removeTaskReminder)
router.patch("/:id/google-event", updateGoogleEventId)

export default router

