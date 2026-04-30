const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key",
      );

      req.user = await User.findById(decoded.userId).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "User not found",
        });
      }

      if (req.user.status !== "ACTIVE") {
        return res.status(403).json({
          success: false,
          error: "Account is deactivated",
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: "Not authorized",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Not authorized, no token",
    });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: "Admin access required",
    });
  }
};

const waiter = (req, res, next) => {
  if (req.user && (req.user.role === "waiter" || req.user.role === "admin")) {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: "Waiter access required",
    });
  }
};

const kitchen = (req, res, next) => {
  if (req.user && (req.user.role === "kitchen" || req.user.role === "admin")) {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: "Kitchen access required",
    });
  }
};

const counter = (req, res, next) => {
  if (req.user && (req.user.role === "counter" || req.user.role === "admin")) {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: "Counter access required",
    });
  }
};

module.exports = { protect, admin, waiter, kitchen, counter };
