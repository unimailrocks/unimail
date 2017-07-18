import formatDate from 'dateformat';

export function commonFriendlyDateString(date) {
  const now = new Date();
  if (formatDate(date, 'shortDate') === formatDate(now, 'shortDate')) {
    return formatDate(date, '\'at\' h:MM TT');
  }

  return formatDate(date, '\'on\' mmm d \'at\' h:MM TT');
}
