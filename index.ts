import { createInterface } from "readline";
import type { City, Tour } from "./types";
import { AntColony } from "./antColony";

const getCityNamesFromTour = (tour: Tour, cities: City[]) => {
  return tour.map((index) => cities[index].name).join(" -> ");
};

const getInputFromConsole = async (question: string) => {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<string>((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

const getIndexFromCityName = (cities: City[], cityName: string) => {
  for (let i = 0; i < cities.length; i++) {
    if (cities[i].name === cityName) {
      return i;
    }
  }
  return undefined;
};

const main = async () => {
  let numCities = parseInt(await getInputFromConsole("Podaj liczbę punktów: "));

  while (isNaN(numCities)) {
    console.log("Liczba punktów musi być liczbą całkowitą");
    numCities = parseInt(await getInputFromConsole("Podaj liczbę punktów: "));
  }

  const cities: City[] = [];
  for (let i = 0; i < numCities; i++) {
    const name = await getInputFromConsole(`Podaj nazwę punktu ${i + 1}: `);
    let x = parseFloat(
      await getInputFromConsole(`Podaj współrzędną x punktu ${name}: `),
    );

    while (isNaN(x)) {
      console.log("Współrzędna x musi być liczbą");
      x = parseFloat(
        await getInputFromConsole(`Podaj współrzędną x punktu ${name}: `),
      );
    }

    let y = parseFloat(
      await getInputFromConsole(`Podaj współrzędną y punktu ${name}: `),
    );

    while (isNaN(y)) {
      console.log("Współrzędna y musi być liczbą");
      y = parseFloat(
        await getInputFromConsole(`Podaj współrzędną y punktu ${name}: `),
      );
    }

    cities.push({ name, x, y });
  }

  const numAnts = 10;
  const alpha = 1;
  const beta = 2;
  const rho = 0.5;
  const q = 100;

  const startPoint = await getInputFromConsole(
    "Podaj indeks lub nazwę punktu startowego: ",
  );

  const startIndex = isNaN(parseInt(startPoint))
    ? getIndexFromCityName(cities, startPoint)
    : parseInt(startPoint);

  if (startIndex === undefined) {
    console.log("Nieprawidłowy punkt startowy");
    return;
  }

  const colony = new AntColony(
    cities,
    numAnts,
    alpha,
    beta,
    rho,
    q,
    startIndex,
  );
  const iterations = parseInt(
    await getInputFromConsole("Podaj liczbę iteracji: "),
  );
  const { bestTour, shortestDistance, allTours } = colony.run(iterations);

  console.log("\nWszystkie trasy i ich długości:");
  allTours.forEach(({ iteration, tours }) => {
    console.log(`Iteracja ${iteration}:`);
    tours.forEach((tour, index) => {
      console.log(
        `Trasa ${index + 1}: ${getCityNamesFromTour(tour, cities)}, Długość: ${colony.calculateTourDistance(tour)}`,
      );
    });
    console.log("------------");
  });

  console.log("Najkrótsza trasa:", getCityNamesFromTour(bestTour, cities));
  console.log("Długość trasy:", shortestDistance);
};

main();
