import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const protect = async (req, res, next) => {
  let token

  // Check if token exists in cookies
  if (req.cookies.token) {
    token = req.cookies.token
  }
  // Also check for token in Authorization header (for API clients)
  else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized to access this route" })
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret")

    // Get user from the token
    req.user = await User.findById(decoded.id).select("-password")

    if (!req.user) {
      return res.status(401).json({ message: "User not found" })
    }

    next()
  } catch (error) {
    return res.status(401).json({ message: "Not authorized to access this route" })
  }
}

