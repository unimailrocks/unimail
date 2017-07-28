export function rectanglesOverlap(rect1, rect2) {
  if (
    rect1.x + rect1.width < rect2.x // rect1 is to the left of rect2
    || rect2.x + rect2.width < rect1.x // rect2 is to the left of rect1
  ) {
    return false;
  }

  if (
    rect1.y + rect1.height < rect2.y // rect1 is above rect2
    || rect2.y + rect2.height < rect1.y // rect2 is above rect 1
  ) {
    return false;
  }

  return true;
}

// Returns whether rect1 contains rect2
export function rectangleContains(rect1, rect2) {
  return (
    (rect2.x + rect2.width) <= (rect1.x + rect1.width) &&
    (rect2.x >= rect1.x) &&
    (rect2.y + rect2.height) <= (rect1.y + rect1.height) &&
    (rect2.y >= rect1.y)
  );
}
