import React, { useEffect, useState } from 'react';
import { getDashboardData } from '../api/mockApi';
import { SensorData } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<SensorData[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      getDashboardData().then(setData);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calcula velocidade a partir da aceleração (simplificado)
  let velocity = 0;
  const dataWithVelocity = data.map((d, i) => {
    if (i === 0) {
      velocity = 0;
    } else {
      const dt = (d.timestamp - data[i - 1].timestamp) / 1000;
      velocity += d.accZ * dt;
    }
    return { ...d, velocity };
  });

  return (
    <div>
      <h2>Altitude vs Tempo</h2>
      <LineChart width={600} height={300} data={dataWithVelocity}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="altitude" stroke="#8884d8" />
      </LineChart>

      <h2>Velocidade vs Tempo</h2>
      <LineChart width={600} height={300} data={dataWithVelocity}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="velocity" stroke="#82ca9d" />
      </LineChart>

      <h2>Pressão da água vs Tempo</h2>
      <LineChart width={600} height={300} data={dataWithVelocity}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="pressure" stroke="#ff7300" />
      </LineChart>
    </div>
  );
}; 