import mongoose from "mongoose"

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    dueDate: {
      type: Date,
    },
    position: {
      type: Number,
      default: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reminderSet: {
      type: Boolean,
      default: false,
    },
    reminderTime: {
      type: Number, // Minutes before due date
    },
    googleEventId: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

// Index for faster queries by user
taskSchema.index({ userId: 1, position: 1 })

const Task = mongoose.model("Task", taskSchema)

export default Task

