const buildAppointmentFilter = (query) => {
  const { search, doctor, patient, department, status, startDate, endDate } =
    query;

  const filter = {};

  // -------------------------------
  // Doctor filter
  // -------------------------------
  if (doctor) {
    filter.doctor = doctor;
  }

  // -------------------------------
  // Patient filter
  // -------------------------------
  if (patient) {
    filter.patient = patient;
  }

  // -------------------------------
  // Department filter
  // -------------------------------
  if (department) {
    filter.department = department;
  }

  // -------------------------------
  // Status filter
  // -------------------------------
  if (status) {
    filter.status = status;
  }

  // -------------------------------
  // Date range filter
  // -------------------------------
  if (startDate || endDate) {
    filter.appointmentDate = {};

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      filter.appointmentDate.$gte = start;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      filter.appointmentDate.$lte = end;
    }
  }

  return {
    filter,
    search: search ? search.trim() : "",
  };
};

module.exports = {
  buildAppointmentFilter,
};
