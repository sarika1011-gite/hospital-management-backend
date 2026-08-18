const Department = require("../models/Department");

// Create Department
const createDepartment = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Department name is required.",
      });
    }

    const existingDepartment = await Department.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });

    if (existingDepartment) {
      return res.status(409).json({
        success: false,
        message: "Department already exists.",
      });
    }

    const department = await Department.create({
      name,
      description,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Department created successfully.",
      department,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Departments
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Department By ID
const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found.",
      });
    }

    res.status(200).json({
      success: true,
      department,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Department
const updateDepartment = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found.",
      });
    }

    if (name) {
      const existingDepartment = await Department.findOne({
        name: { $regex: `^${name}$`, $options: "i" },
        _id: { $ne: req.params.id },
      });

      if (existingDepartment) {
        return res.status(409).json({
          success: false,
          message: "Department already exists.",
        });
      }

      department.name = name;
    }

    if (description !== undefined) {
      department.description = description;
    }

    if (status !== undefined) {
      department.status = status;
    }

    await department.save();

    res.status(200).json({
      success: true,
      message: "Department updated successfully.",
      department,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Department
const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found.",
      });
    }

    await Department.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Department deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};
