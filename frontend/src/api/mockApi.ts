import { SensorData } from '../types';

let sessionId = 'mock-session-1';
let data: SensorData[] = [];

export function launchRocket() {
  sessionId = 'mock-session-' + Math.floor(Math.random() * 10000);
  data = [];
  return Promise.resolve({ sessionId });
}

export function sendSensorData(sensorData: SensorData) {
  data.push(sensorData);
  return Promise.resolve({ success: true });
}

export function getDashboardData() {
  return Promise.resolve(data);
} 