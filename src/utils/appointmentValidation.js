// ======================================
// APPOINTMENT BUSINESS VALIDATION
// ======================================

// Convert time slot such as:
// "10:00 AM - 10:30 AM"
// "10:00"
// "14:30"
// into a Date for the selected appointment date.
const getAppointmentDateTime = (appointmentDate, timeSlot) => {
  const date = new Date(appointmentDate);

  if (!timeSlot) {
    return date;
  }

  const timeText = String(timeSlot).split("-")[0].trim().toUpperCase();

  let hours;
  let minutes;

  // 12-hour format: 10:30 AM / 2:00 PM
  const amPmMatch = timeText.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/);

  if (amPmMatch) {
    hours = Number(amPmMatch[1]);
    minutes = Number(amPmMatch[2] || 0);

    const period = amPmMatch[3];

    if (period === "AM" && hours === 12) {
      hours = 0;
    }

    if (period === "PM" && hours !== 12) {
      hours += 12;
    }
  } else {
    // 24-hour format: 14:30
    const twentyFourHourMatch = timeText.match(/^(\d{1,2})(?::(\d{2}))?$/);

    if (twentyFourHourMatch) {
      hours = Number(twentyFourHourMatch[1]);
      minutes = Number(twentyFourHourMatch[2] || 0);
    }
  }

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  date.setHours(hours, minutes, 0, 0);

  return date;
};

// ======================================
// CHECK PAST APPOINTMENT
// ======================================
const isPastAppointment = (appointmentDate, timeSlot) => {
  const appointmentDateTime = getAppointmentDateTime(appointmentDate, timeSlot);

  if (!appointmentDateTime) {
    return false;
  }

  return appointmentDateTime.getTime() < Date.now();
};

// ======================================
// CHECK COMPLETED / LOCKED APPOINTMENT
// ======================================
const isAppointmentLocked = (status) => {
  return ["COMPLETED", "CANCELLED"].includes(status);
};

module.exports = {
  getAppointmentDateTime,
  isPastAppointment,
  isAppointmentLocked,
};
