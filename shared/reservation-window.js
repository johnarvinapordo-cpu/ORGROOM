// Shared reservation operating hours for the ORGROOM frontend and backend.
// Values are campus wall-clock minutes after midnight (Asia/Manila).

export const RESERVATION_WINDOW_START_MINUTES = 7 * 60;

export const RESERVATION_WINDOW_END_MINUTES = 20 * 60 + 30;

export const RESERVATION_WINDOW_MESSAGE =
  'Reservations are available only from 7:00 AM to 8:30 PM.';

export const RESERVATION_WINDOW_SYNC_ERROR =
  'The room-schedule service is using different reservation hours. Please wait until the frontend and backend updates are both deployed, then refresh.';

export function isWithinReservationWindow(
  startMinutes,
  endMinutes,
  windowStart = RESERVATION_WINDOW_START_MINUTES,
  windowEnd = RESERVATION_WINDOW_END_MINUTES
) {
  return Number.isFinite(startMinutes)
    && Number.isFinite(endMinutes)
    && Number.isFinite(windowStart)
    && Number.isFinite(windowEnd)
    && windowStart < windowEnd
    && startMinutes >= windowStart
    && endMinutes <= windowEnd;
}

export function formatReservationWindowMessage(startMinutes, endMinutes) {
  const toClock = value => {
    const hour24 = Math.floor(value / 60);
    const minute = value % 60;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 || 12;
    return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
  };
  return `Reservations are available only from ${toClock(startMinutes)} to ${toClock(endMinutes)}.`;
}