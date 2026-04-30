const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "7d",
  });
};

// Register User
const register = async (req, res) => {
  try {
    const { name, email, password, mobileNo, address, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !mobileNo) {
      return res.status(400).json({
        success: false,
        error: "Please provide all required fields: name, email, password, mobileNo",
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: "User already exists with this email",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      mobileNo,
      address: address || "",
      role: role || "customer",
      status: "ACTIVE",
    });

    // Generate token
    const token = generateToken(user._id);

    // Return user without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      mobileNo: user.mobileNo,
      address: user.address,
      role: user.role,
      status: user.status,
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Registration failed",
    });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide email and password",
      });
    }

    // Find user with password field
    const user = await User.findOne({
      email: { $regex: new RegExp("^" + email + "$", "i") },
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Check account status
    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        error: "Account is deactivated. Please contact support.",
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return user without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      mobileNo: user.mobileNo,
      address: user.address,
      role: user.role,
      status: user.status,
    };

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Login failed",
    });
  }
};

// Get Current User
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch user data",
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};