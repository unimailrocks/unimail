import formatDate from 'dateformat';

export function commonFriendlyDateString(date) {
  const now = new Date();
  if (formatDate(date, 'shortDate') === formatDate(now, 'shortDate')) {
    return formatDate(date, '\'at\' h:MM TT');
  }

  return formatDate(date, '\'on\' mmm d \'at\' h:MM TT');
}

export function hashStringToNumber(string) {
  /* eslint-disable no-bitwise */
  let hash = 0;
  for (let i = 0; i < string.length; i += 1) {
    const c = string.charCodeAt(i);
    hash = (((hash << 5) - hash) + c) | 0;
  }

  return hash;
  /* eslint-enable no-bitwise */
}
