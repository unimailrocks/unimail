export function relativeClickCoordinates(event) {
  const boundingRect = event.target.getBoundingClientRect();

  return {
    x: event.clientX - boundingRect.left,
    y: event.clientY - boundingRect.top,
  };
}
