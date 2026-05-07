export function haveSameLines(left = [], right = []) {
  if (left.length !== right.length) {
    return false;
  }

  const rightSet = new Set(right);

  return left.every((line) => rightSet.has(line));
}

export function toggleHighlightedLocations({
  isSelected,
  locations,
}) {
  return isSelected ? [] : locations;
}