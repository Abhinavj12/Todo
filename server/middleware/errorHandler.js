export const errorHandler = (err, req, res, next) => {
  console.error(err.stack)

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode
  let message = err.message || "Server Error"

  // Mongoose bad ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404
    message = "Resource not found"
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400
    message = "Duplicate field value entered"
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ")
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  })
}

