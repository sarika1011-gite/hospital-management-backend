const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    diagnosis: {
      type: String,
      default: "",
      trim: true,
    },

    medicines: [
      {
        medicine: {
          type: String,
          required: true,
          trim: true,
        },

        dosage: {
          type: String,
          required: true,
          trim: true,
        },

        frequency: {
          type: String,
          required: true,
          trim: true,
        },

        duration: {
          type: String,
          required: true,
          trim: true,
        },

        instructions: {
          type: String,
          default: "",
          trim: true,
        },
      },
    ],

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Prescription", prescriptionSchema);
