export function manhattanDistance(X1, Y1, X2, Y2) {
  // latitude Y
  // longitude X

  let dist = Math.abs(X2 - X1) + Math.abs(Y2 - Y1);
  return dist;
}

