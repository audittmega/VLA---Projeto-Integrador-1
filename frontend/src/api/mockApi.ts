import { SensorData, ProcessedData, SavedLaunch } from '../types';

let data: ProcessedData[] = [];
let savedLaunches: SavedLaunch[] = [];
let isLaunched = false;
let startTime = 0;

// Load saved launches from localStorage on initialization
const loadSavedLaunches = () => {
  const saved = localStorage.getItem('savedLaunches');
  if (saved) {
    savedLaunches = JSON.parse(saved);
  }
};

loadSavedLaunches();

export const processRawData = (rawData: SensorData): ProcessedData => {
  return {
    altitude: rawData.sensors.altimetro.altitude,
    pressure: rawData.sensors.altimetro.pressure,
    acceleration: Math.sqrt(
      Math.pow(rawData.sensors.acelerometro.accX, 2) +
      Math.pow(rawData.sensors.acelerometro.accY, 2) +
      Math.pow(rawData.sensors.acelerometro.accZ, 2)
    ),
    timestamp: rawData.timestamp,
    roll: rawData.sensors.acelerometro.roll,
    pitch: rawData.sensors.acelerometro.pitch,
  };
};

function generateSensorData(elapsedTime: number): SensorData {
  const timestamp = Date.now();
  const altitude = Math.min(10000, elapsedTime * 0.1); // Max altitude of 10km
  const pressure = Math.max(0, 101.325 - altitude * 0.01); // Pressure decreases with altitude
  const acceleration = Math.max(0, 20 - elapsedTime * 0.001); // Initial acceleration that decreases

  return {
    sensors: {
      altimetro: {
        altitude,
        pressure
      },
      acelerometro: {
        accX: acceleration * (Math.random() * 0.2 - 0.1),
        accY: acceleration * (Math.random() * 0.2 - 0.1),
        accZ: acceleration,
        gyroX: Math.random() * 2 - 1,
        gyroY: Math.random() * 2 - 1,
        gyroZ: Math.random() * 2 - 1,
        temp: 25 + Math.random() * 10,
        roll: Math.random() * 10 - 5,
        pitch: Math.random() * 10 - 5
      }
    },
    timestamp
  };
}

export function launchRocket() {
  isLaunched = true;
  startTime = Date.now();
  data = [];
}

export function stopRocket() {
  isLaunched = false;
  return [...data];
}

export function getCurrentData(): ProcessedData[] {
  if (!isLaunched) return [...data];

  const elapsedTime = Date.now() - startTime;
  const newData = generateSensorData(elapsedTime);
  const processedData = processRawData(newData);
  data.push(processedData);
  
  // Keep only last 100 points
  if (data.length > 100) {
    data = data.slice(-100);
  }
  
  return [...data];
}

export const saveLaunch = (name: string) => {
  const newLaunch: SavedLaunch = {
    id: Date.now().toString(),
    name,
    date: new Date().toISOString(),
    data: [...data]
  };
  savedLaunches.push(newLaunch);
  localStorage.setItem('savedLaunches', JSON.stringify(savedLaunches));
  return newLaunch;
};

export const getSavedLaunches = (): SavedLaunch[] => {
  return [...savedLaunches];
};

export const clearCurrentData = () => {
  data = [];
}; 