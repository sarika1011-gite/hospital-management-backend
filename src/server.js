const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// ===============================
// CORS
// ===============================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5176",
    ],
    credentials: true,
  }),
);

// ===============================
// BODY PARSER
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// ROUTES
// ===============================
const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const reportRoutes = require("./routes/reportRoutes");
const consultationRoutes = require("./routes/consultationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const searchRoutes = require("./routes/searchRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api", adminRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/search", searchRoutes);

// ===============================
// TEST ROUTE
// ===============================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Hospital Appointment Management API is running.",
  });
});

// ===============================
// MONGODB CONNECTION
// ===============================
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.use("/api/appointments", require("./routes/appointmentRoutes"));
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  });
