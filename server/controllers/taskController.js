import Task from "../models/Task.js"

// Get all tasks for the current user
export const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.user.id }).sort({ position: 1, createdAt: -1 })

    res.status(200).json(tasks)
  } catch (error) {
    next(error)
  }
}

// Create a new task
export const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate } = req.body

    // Get the highest position to place the new task at the end
    const highestPositionTask = await Task.findOne({ userId: req.user.id }).sort({ position: -1 }).limit(1)

    const position = highestPositionTask ? highestPositionTask.position + 1 : 0

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      position,
      userId: req.user.id,
    })

    res.status(201).json(task)
  } catch (error) {
    next(error)
  }
}

// Get a single task
export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    res.status(200).json(task)
  } catch (error) {
    next(error)
  }
}

// Update a task
export const updateTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate } = req.body

    let task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, priority, dueDate },
      { new: true, runValidators: true },
    )

    res.status(200).json(task)
  } catch (error) {
    next(error)
  }
}

// Update task status
export const updateTaskStatus = async (req, res, next) => {
  try {
    const { completed } = req.body

    let task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    task = await Task.findByIdAndUpdate(req.params.id, { completed }, { new: true })

    res.status(200).json(task)
  } catch (error) {
    next(error)
  }
}

// Update task position (for drag and drop)
export const updateTaskPosition = async (req, res, next) => {
  try {
    const { position } = req.body

    let task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    // Update the position of the task
    task = await Task.findByIdAndUpdate(req.params.id, { position }, { new: true })

    res.status(200).json(task)
  } catch (error) {
    next(error)
  }
}

// Delete a task
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    await task.deleteOne()

    res.status(200).json({ message: "Task deleted successfully" })
  } catch (error) {
    next(error)
  }
}

// Set a reminder for a task
export const setTaskReminder = async (req, res, next) => {
  try {
    const { reminderMinutes } = req.body

    if (!reminderMinutes || reminderMinutes <= 0) {
      return res.status(400).json({ message: "Valid reminder time is required" })
    }

    let task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    if (!task.dueDate) {
      return res.status(400).json({ message: "Task must have a due date to set a reminder" })
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        reminderSet: true,
        reminderTime: reminderMinutes,
      },
      { new: true },
    )

    res.status(200).json(task)
  } catch (error) {
    next(error)
  }
}

// Remove a reminder from a task
export const removeTaskReminder = async (req, res, next) => {
  try {
    let task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        reminderSet: false,
        reminderTime: null,
        googleEventId: null,
      },
      { new: true },
    )

    res.status(200).json(task)
  } catch (error) {
    next(error)
  }
}

// Update Google Calendar event ID for a task
export const updateGoogleEventId = async (req, res, next) => {
  try {
    const { googleEventId } = req.body

    let task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    task = await Task.findByIdAndUpdate(req.params.id, { googleEventId }, { new: true })

    res.status(200).json(task)
  } catch (error) {
    next(error)
  }
}

