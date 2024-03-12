export interface City {
  name: string;
  x: number;
  y: number;
  feromone?: number;
}

export interface Tours {
  iteration: number;
  tours: Matrix;
}

export type Matrix = number[][];
export type Tour = number[];
