import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

export function formatDate(dateString: string | Date | undefined, formatPattern: string = 'dd MMM yyyy'): string {
  if (!dateString) return '-';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (!isValid(date)) return '-';
    return format(date, formatPattern);
  } catch (err) {
    return '-';
  }
}

export function formatDateTime(dateString: string | Date | undefined): string {
  return formatDate(dateString, 'dd MMM yyyy, hh:mm a');
}

export function formatTimeAgo(dateString: string | Date | undefined): string {
  if (!dateString) return '-';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (!isValid(date)) return '-';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (err) {
    return '-';
  }
}
