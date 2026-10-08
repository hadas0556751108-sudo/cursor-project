// Hebrew UI labels for DB enum values
export const roleLabels: Record<string, string> = {
  admin: 'מנהל מערכת',
  manager: 'מנהל מחלקה',
  finance: 'כספים',
  employee: 'עובד',
};

export const statusLabels: Record<string, string> = {
  approved: 'אושר',
  rejected: 'נדחה',
  pending_dept: 'ממתין לאישור מחלקה',
  pending_finance: 'ממתין לאישור כספים',
  scheduled: 'מתוכנן',
  completed: 'הושלם',
  cancelled: 'בוטל',
};

export const shiftTypeLabels: Record<string, string> = {
  morning: 'בוקר',
  evening: 'ערב',
  night: 'לילה',
  weekend: 'סוף שבוע',
};

export const requestTypeLabels: Record<string, string> = {
  vacation: 'חופשה',
  sick_leave: 'מחלה',
  expense: 'החזר הוצאות',
};

export const t = (map: Record<string, string>, key?: string | null) =>
  (key && map[key]) || key || '';
