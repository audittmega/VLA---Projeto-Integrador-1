export interface SensorData {
  sensors: {
    altimetro: {
      altitude: number;
      pressure: number;
    };
    acelerometro: {
      accX: number;
      accY: number;
      accZ: number;
      gyroX: number;
      gyroY: number;
      gyroZ: number;
      temp: number;
      roll: number;
      pitch: number;
    };
  };
  timestamp: number;
}

export interface ProcessedData {
  altitude: number;
  pressure: number;
  acceleration: number;
  timestamp: number;
  roll: number;
  pitch: number;
}

export interface SavedLaunch {
  id: string;
  name: string;
  date: string;
  data: ProcessedData[];
} 