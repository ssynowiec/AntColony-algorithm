import type { Point } from "./types";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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

const addPointManually = (): Promise<Point> => {
  return new Promise((resolve, reject) => {
    rl.question("Podaj nazwę punktu: ", (name: string) => {
      rl.question("Podaj współrzędną x: ", (xStr: string) => {
        const x = parseFloat(xStr);
        if (isNaN(x)) {
          reject(new Error("Współrzędna x musi być liczbą"));
          return;
        }
        rl.question("Podaj współrzędną y: ", (yStr: string) => {
          const y = parseFloat(yStr);
          if (isNaN(y)) {
            reject(new Error("Współrzędna y musi być liczbą"));
            return;
          }
          resolve({ name, x, y });
        });
      });
    });
  });
};

const main = async () => {
  const points: Point[] = [];

  while (true) {
    try {
      const point = await addPointManually();
      points.push(point);
      const addMore = await new Promise<boolean>((resolve) => {
        rl.question(
          "Czy chcesz dodać kolejny punkt? (tak/nie): ",
          (answer: string) => {
            resolve(answer.toLowerCase() === "tak");
          },
        );
      });
      if (!addMore) {
        break;
      }
    } catch (error) {
      console.error(error.message);
    }
  }

  const startingIndex = await new Promise<number>((resolve) => {
    rl.question("Podaj indeks punktu startowego: ", (indexStr: string) => {
      const index = parseInt(indexStr);
      resolve(index);
    });
  });

  if (
    isNaN(startingIndex) ||
    startingIndex < 0 ||
    startingIndex >= points.length
  ) {
    console.error("Nieprawidłowy indeks punktu startowego");
    rl.close();
    return;
  }

  const { path, distance } = nearestNeighborTSP(points, startingIndex);

  console.log(
    "Najkrótsza ścieżka według algorytmu najbliższego sąsiada (z punktu startowego):",
    path,
  );
  console.log("Długość najkrótszej ścieżki:", distance);

  rl.close();
};

main();
