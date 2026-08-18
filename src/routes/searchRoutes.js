const express = require("express");

const router = express.Router();

const {
  searchDoctors,
  searchPatients,
  searchDepartments,
} = require("../controllers/searchController");

const { protect } = require("../middleware/authMiddleware");

// Search doctors
router.get("/doctors", protect, searchDoctors);

// Search patients
router.get("/patients", protect, searchPatients);

// Search departments
router.get("/departments", protect, searchDepartments);

module.exports = router;
