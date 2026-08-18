import api from "./api";

// ======================================
// CREATE APPOINTMENT
// ======================================
export const createAppointment = async (appointmentData) => {
  const response = await api.post("/appointments", {
    doctor: appointmentData.doctor,
    department: appointmentData.department,
    appointmentDate: appointmentData.appointmentDate,
    timeSlot: appointmentData.timeSlot,
    reasonForVisit: appointmentData.reasonForVisit,
  });

  return response.data;
};

// ======================================
// GET ALL APPOINTMENTS
// ======================================
export const getAppointments = async () => {
  const response = await api.get("/appointments");
  return response.data;
};

// ======================================
// GET MY APPOINTMENTS
// ======================================
export const getMyAppointments = async () => {
  const response = await api.get("/appointments/my");
  return response.data;
};

// ======================================
// GET DOCTOR APPOINTMENTS
// ======================================
export const getDoctorAppointments = async () => {
  const response = await api.get("/appointments/doctor");
  return response.data;
};

// ======================================
// UPDATE STATUS
// ======================================
export const updateAppointmentStatus = async (
  id,
  status,
  cancellationReason = "",
) => {
  const response = await api.put(`/appointments/${id}/status`, {
    status,
    cancellationReason,
  });

  return response.data;
};

// ======================================
// CANCEL APPOINTMENT
// ======================================
export const cancelAppointment = async (id, cancellationReason = "") => {
  const response = await api.put(`/appointments/${id}/status`, {
    status: "CANCELLED",
    cancellationReason,
  });

  return response.data;
};
