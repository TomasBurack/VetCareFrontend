const ARGENTINA_TIME_ZONE = 'America/Argentina/Buenos_Aires';

const formatter = new Intl.DateTimeFormat('es-AR', {
  timeZone: ARGENTINA_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatShiftDate(dateShift) {
  if (!dateShift) return '';
  return formatter.format(new Date(dateShift));
}
