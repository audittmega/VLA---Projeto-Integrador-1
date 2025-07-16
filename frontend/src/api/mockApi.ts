import { SensorData, ProcessedData, SavedLaunch } from '../types';

let data: ProcessedData[] = [];
let savedLaunches: SavedLaunch[] = [];
let isLaunched = false;
let startTime = 0;
let currentRange: 10 | 20 | 30 = 10;

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
  // Parâmetros teóricos do relatório
  let maxAltitude = 5.0, maxTime = 1.43, v0 = 9.89;
  if (currentRange === 20) {
    maxTime = 2.02; v0 = 14.0;
  } else if (currentRange === 30) {
    maxTime = 2.47; v0 = 17.18;
  }
  // Altitude: sobe até o máximo (5m), depois desce
  let t = (elapsedTime / 1000);
  let altitude = 0;
  if (t <= maxTime/2) {
    altitude = (4 * maxAltitude / (maxTime*maxTime)) * t * (maxTime - t); // parábola
  } else if (t <= maxTime) {
    altitude = (4 * maxAltitude / (maxTime*maxTime)) * t * (maxTime - t);
  } else {
    altitude = 0;
  }
  // Pressão: apenas pequenas variações em torno da atmosférica
  let pressure = 102.5 + (Math.random() - 0.5) * 1.0; // 102~103 kPa
  // Aceleração: pico inicial, depois cai
  let acceleration = 20 * Math.exp(-t / (maxTime * 0.2));
  // Pequenas variações aleatórias
  altitude += (Math.random() - 0.5) * 0.05;
  acceleration += (Math.random() - 0.5) * 0.5;
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

export function launchRocket(range: 10 | 20 | 30 = 10) {
  isLaunched = true;
  startTime = Date.now();
  data = [];
  currentRange = range;
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

export const deleteLaunch = (id: string) => {
  savedLaunches = savedLaunches.filter(l => l.id !== id);
  localStorage.setItem('savedLaunches', JSON.stringify(savedLaunches));
};

export const clearCurrentData = () => {
  data = [];
}; 