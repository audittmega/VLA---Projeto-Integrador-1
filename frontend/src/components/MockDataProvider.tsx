import React, { useEffect, useRef } from 'react';
import { sendSensorData } from '../api/mockApi';
import { SensorData } from '../types';

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

interface MockDataProviderProps {
  flying: boolean;
}

export const MockDataProvider: React.FC<MockDataProviderProps> = ({ flying }) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timestampRef = useRef(0);

  useEffect(() => {
    if (flying) {
      intervalRef.current = setInterval(() => {
        const mock: SensorData = {
          altitude: randomBetween(0, 100),
          pressure: randomBetween(900, 1100),
          accX: randomBetween(-2, 10),
          accY: randomBetween(-2, 10),
          accZ: randomBetween(-2, 10),
          timestamp: timestampRef.current += 1000,
        };
        sendSensorData(mock);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [flying]);

  return null;
}; 