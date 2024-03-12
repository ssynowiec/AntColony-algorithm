import { City, Matrix, Tour, Tours } from "./types";

export class AntColony {
  cities: City[];
  numAnts: number;
  alpha: number;
  beta: number;
  rho: number;
  q: number;
  startIndex: number;

  distanceMatrix: number[][];
  pheromoneMatrix: number[][];

  constructor(
    cities: City[],
    numAnts: number,
    alpha: number,
    beta: number,
    rho: number,
    q: number,
    startIndex: number,
  ) {
    this.cities = cities;
    this.numAnts = numAnts;
    this.alpha = alpha; // waga feromonów
    this.beta = beta; // waga widoczności ścieżki
    this.rho = rho; // stopa parowania feromonów
    this.q = q; // ilość feromonów wydzielanych przez jedną mrówkę
    this.startIndex = startIndex;

    this.distanceMatrix = this.calculateDistanceMatrix();
    this.pheromoneMatrix = this.initializePheromoneMatrix(cities.length);
  }

  calculateDistanceMatrix() {
    const numCities = this.cities.length;
    const matrix: Matrix = [];
    for (let i = 0; i < numCities; i++) {
      matrix[i] = [];
      for (let j = 0; j < numCities; j++) {
        if (i === j) {
          matrix[i][j] = 0;
        } else {
          const city1 = this.cities[i];
          const city2 = this.cities[j];
          const distance = Math.sqrt(
            Math.pow(city1.x - city2.x, 2) + Math.pow(city1.y - city2.y, 2),
          );
          matrix[i][j] = distance;
        }
      }
    }
    return matrix;
  }

  private initializePheromoneMatrix(size: number) {
    const initialValue = 1 / (size * size); // początkowa wartość feromonów
    const matrix: Matrix = [];
    for (let i = 0; i < size; i++) {
      matrix[i] = [];
      for (let j = 0; j < size; j++) {
        matrix[i][j] = initialValue;
      }
    }
    return matrix;
  }

  public run(iterations: number) {
    let bestTour: Tour = [];
    let shortestDistance = Infinity;
    let allTours: Tours[] = [];

    for (let i = 0; i < iterations; i++) {
      const antTours: Tour[] = [];
      for (let j = 0; j < this.numAnts; j++) {
        const tour = this.generateAntTour();
        antTours.push(tour);
        const tourDistance = this.calculateTourDistance(tour);
        if (tourDistance < shortestDistance) {
          shortestDistance = tourDistance;
          bestTour = tour;
        }
      }
      allTours.push({ iteration: i + 1, tours: antTours });
      this.updatePheromoneMatrix(antTours);
    }

    return {
      bestTour,
      shortestDistance,
      allTours,
    };
  }

  private generateAntTour() {
    const tour: Tour = [];
    const visited = new Array(this.cities.length).fill(false);
    let currentIndex =
      this.startIndex !== undefined
        ? this.startIndex
        : Math.floor(Math.random() * this.cities.length);
    tour.push(currentIndex);
    visited[currentIndex] = true;

    for (let i = 1; i < this.cities.length; i++) {
      const nextCity = this.selectNextCity(currentIndex, visited);
      tour.push(nextCity);
      visited[nextCity] = true;
      currentIndex = nextCity;
    }

    // Dodaj powrót do punktu początkowego
    tour.push(this.startIndex!);

    return tour;
  }

  private selectNextCity(currentIndex: number, visited: boolean[]) {
    // const currentCity = this.cities[currentIndex];
    const probabilities: { cityIndex: number; probability: number }[] = [];

    for (let i = 0; i < this.cities.length; i++) {
      if (!visited[i]) {
        const visibility = 1 / this.distanceMatrix[currentIndex][i]; // widoczność ścieżki
        const pheromone = this.pheromoneMatrix[currentIndex][i]; // ilość feromonów
        const probability =
          Math.pow(pheromone, this.alpha) * Math.pow(visibility, this.beta);
        probabilities.push({ cityIndex: i, probability });
      }
    }

    const sum = probabilities.reduce((acc, curr) => acc + curr.probability, 0);
    const random = Math.random() * sum;
    let cumulativeProbability = 0;

    for (const { cityIndex, probability } of probabilities) {
      cumulativeProbability += probability;
      if (random <= cumulativeProbability) {
        return cityIndex;
      }
    }
  }

  public calculateTourDistance(tour: Tour) {
    let distance = 0;
    for (let i = 0; i < tour.length - 1; i++) {
      const from = tour[i];
      const to = tour[i + 1];
      distance += this.distanceMatrix[from][to];
    }
    const lastCityIndex = tour[tour.length - 1];
    const firstCityIndex = tour[0];
    distance += this.distanceMatrix[lastCityIndex][firstCityIndex]; // powrót do startowego miasta
    return distance;
  }

  private updatePheromoneMatrix(antTours: Tour[]) {
    for (let i = 0; i < this.cities.length; i++) {
      for (let j = 0; j < this.cities.length; j++) {
        let pheromoneDeposit = 0;
        for (const tour of antTours) {
          const index = tour.indexOf(i);
          if (index !== -1 && tour[index + 1] === j) {
            pheromoneDeposit += this.q / this.calculateTourDistance(tour);
          }
        }
        this.pheromoneMatrix[i][j] =
          (1 - this.rho) * this.pheromoneMatrix[i][j] + pheromoneDeposit;
      }
    }
  }
}
