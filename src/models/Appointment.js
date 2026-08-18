const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    appointmentDate: {
      type: Date,
      required: true,
    },

    timeSlot: {
      type: String,
      required: true,
      trim: true,
    },

    reasonForVisit: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    status: {
      type: String,
      enum: [
        "BOOKED",
        "CHECKED_IN",
        "WAITING",
        "IN_CONSULTATION",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "BOOKED",
    },

    cancellationReason: {
      type: String,
      default: "",
      trim: true,
    },

    checkedInAt: {
      type: Date,
      default: null,
    },

    consultationStartedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent double booking for the same doctor,
// date and time slot.
appointmentSchema.index(
  {
    doctor: 1,
    appointmentDate: 1,
    timeSlot: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $nin: ["CANCELLED"],
      },
    },
  },
);

module.exports = mongoose.model("Appointment", appointmentSchema);
