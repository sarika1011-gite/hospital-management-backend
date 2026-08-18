const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ===============================
// PROTECT ROUTE
// ===============================
const protect = async (req, res, next) => {
  try {
    let token;

    // ======================================
    // GET TOKEN FROM AUTHORIZATION HEADER
    // ======================================
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // ======================================
    // NO TOKEN
    // ======================================
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login first.",
      });
    }

    // ======================================
    // VERIFY TOKEN
    // ======================================
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error("JWT VERIFY ERROR:", error.message);

      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please login again.",
      });
    }

    // ======================================
    // CHECK USER ID
    // ======================================
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    // ======================================
    // GET CURRENT USER FROM DATABASE
    // ======================================
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    // ======================================
    // ACTIVE ACCOUNT CHECK
    // ======================================
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated.",
      });
    }

    // ======================================
    // NORMALIZE ROLE
    // ======================================
    if (user.role) {
      user.role = String(user.role).trim().toUpperCase();
    }

    // ======================================
    // VALID ROLE CHECK
    // ======================================
    const validRoles = ["ADMIN", "SUPER_ADMIN", "DOCTOR", "PATIENT"];

    if (!validRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Invalid user role. Please contact administrator.",
      });
    }

    // ======================================
    // ATTACH USER TO REQUEST
    // ======================================
    req.user = user;

    // Debug
    console.log("========== PROTECT DEBUG ==========");
    console.log("User ID:", String(user._id));
    console.log("User Name:", user.name);
    console.log("User Email:", user.email);
    console.log("User Role:", user.role);
    console.log("===================================");

    next();
  } catch (error) {
    console.error("PROTECT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

// ===============================
// ROLE AUTHORIZATION
// ===============================
const authorize = (...roles) => {
  return (req, res, next) => {
    // ======================================
    // USER NOT FOUND
    // ======================================
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login again.",
      });
    }

    // ======================================
    // NORMALIZE CURRENT USER ROLE
    // ======================================
    const userRole = String(req.user.role || "")
      .trim()
      .toUpperCase();

    // ======================================
    // NORMALIZE ALLOWED ROLES
    // ======================================
    const allowedRoles = roles.map((role) => String(role).trim().toUpperCase());

    // ======================================
    // DEBUG
    // ======================================
    console.log("========== AUTHORIZATION DEBUG ==========");
    console.log("User ID:", String(req.user._id));
    console.log("User Name:", req.user.name);
    console.log("User Email:", req.user.email);
    console.log("User Role:", userRole);
    console.log("Allowed Roles:", allowedRoles);
    console.log("=========================================");

    // ======================================
    // ROLE CHECK
    // ======================================
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message:
          `Access denied. Your account role is ${userRole}. ` +
          `Required role: ${allowedRoles.join(" or ")}.`,
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
};
