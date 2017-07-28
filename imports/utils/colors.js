import color from 'color';
import { hashStringToNumber } from './strings';

export function hashToColor(x) {
  const str = JSON.stringify(x);
  const num = hashStringToNumber(str);
  return color({ h: num % 360, s: '50%', l: '100%' });
}
