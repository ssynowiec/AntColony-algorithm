import type { Point } from "./types";

const euclideanDistance = (p1: Point, p2: Point): number => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const calculateTotalDistance = (path: Point[]): number => {
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    totalDistance += euclideanDistance(path[i], path[i + 1]);
  }
  return totalDistance;
};

const nearestNeighborTSP = (
  points: Point[],
  startingIndex: number,
): { path: Point[]; distance: number } => {
  if (points.length === 0) return { path: [], distance: 0 };
  if (startingIndex < 0 || startingIndex >= points.length) {
    throw new Error("Invalid starting index");
  }

  const visited: boolean[] = new Array(points.length).fill(false);
  const path: Point[] = [];
  let currentPoint = points[startingIndex];
  path.push(currentPoint);
  visited[startingIndex] = true;

  while (path.length < points.length) {
    let nearestIndex = -1;
    let minDistance = Infinity;

    for (let i = 0; i < points.length; i++) {
      if (!visited[i]) {
        const distance = euclideanDistance(currentPoint, points[i]);
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }
    }

    if (nearestIndex !== -1) {
      path.push(points[nearestIndex]);
      visited[nearestIndex] = true;
      currentPoint = points[nearestIndex];
    } else {
      break;
    }
  }

  path.push(path[0]);

  const distance = calculateTotalDistance(path);

  return { path, distance };
};

const points: Point[] = [
  { name: "A", x: 0, y: 0 },
  { name: "B", x: 4, y: 7 },
  { name: "C", x: 8, y: 13 },
  { name: "D", x: 1, y: 8 },
  { name: "E", x: 6, y: 4 },
  { name: "F", x: 2, y: 10 },
  { name: "G", x: 3, y: 3 },
];

const startingIndex = 1;
const { path, distance } = nearestNeighborTSP(points, startingIndex);
console.log(
  "Najkrótsza ścieżka według algorytmu najbliższego sąsiada (z punktu startowego):",
  path,
);
console.log("Długość najkrótszej ścieżki:", distance);
