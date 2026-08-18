const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const patientRoutes = require("./routes/patientRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const reportRoutes = require("./routes/reportRoutes");
const consultationRoutes = require("./routes/consultationRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");

dotenv.config();

connectDB();

const app = express();

// ===============================
// CORS CONFIGURATION
// ===============================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ],
    credentials: true,
  }),
);

// ===============================
// MIDDLEWARE
// ===============================
app.use(express.json());

// ===============================
// API ROUTES
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/activity-logs", activityLogRoutes);

// ===============================
// ROOT ROUTE
// ===============================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MediFlow Hospital Management API is running",
  });
});

// ===============================
// SERVER
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
