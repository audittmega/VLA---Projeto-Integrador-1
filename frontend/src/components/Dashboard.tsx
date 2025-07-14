import React, { useState, useEffect, useCallback } from 'react';
import { ProcessedData } from '../types';
import { getCurrentData, launchRocket, stopRocket, saveLaunch, clearCurrentData } from '../api/mockApi';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [isLaunched, setIsLaunched] = useState(false);
  const [data, setData] = useState<ProcessedData[]>([]);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const formatTime = (timestamp: number) => {
    const startTime = data[0]?.timestamp || timestamp;
    return `${((timestamp - startTime) / 1000).toFixed(1)}s`;
  };

  const formatValue = (value: number) => {
    return value.toFixed(2);
  };

  const handleLaunch = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8089/api/VLA/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Falha ao iniciar o lançamento no backend');
      }
    } catch (error) {
      alert('Erro ao iniciar o lançamento: ' + (error as Error).message);
      return;
    }
    launchRocket();
    setIsLaunched(true);
    setData([]);

    const id = setInterval(() => {
      const newData = getCurrentData();
      setData(newData);
    }, 100);

    setIntervalId(id);
  }, []);

  const handleStop = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsLaunched(false);
    const finalData = stopRocket();
    setData(finalData);
  }, [intervalId]);

  const handleSave = () => {
    if (data.length === 0) {
      alert('Não há dados para salvar.');
      return;
    }

    const name = prompt('Digite um nome para este lançamento:');
    if (!name) return;

    setIsSaving(true);
    try {
      saveLaunch(name);
      clearCurrentData();
      setData([]);
      navigate('/launches');
    } catch (error) {
      alert('Erro ao salvar o lançamento.');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const getChangePercentage = (values: number[]) => {
    if (values.length < 2) return 0;
    const last = values[values.length - 1];
    const prev = values[values.length - 2];
    return prev !== 0 ? ((last - prev) / prev) * 100 : 0;
  };

  const chartConfig = {
    background: '#1a1f24',
    gridColor: '#2b3640',
    textColor: '#9daebe',
    tooltipBackground: '#2b3640',
    tooltipBorder: '#3d4d5c'
  };

  return (
    <div className="dashboard-container">
      <div className="metrics-grid">
        <div className="metric-card">
          <p className="metric-title">Altitude</p>
          <p className="metric-value">{formatValue(data[data.length - 1]?.altitude || 0)} m</p>
          <div className="flex gap-1">
            <p className="metric-subtitle">Últimos 10 segundos</p>
            <p className={`metric-change ${getChangePercentage(data.map(d => d.altitude)) >= 0 ? 'positive' : 'negative'}`}>
              {formatValue(getChangePercentage(data.map(d => d.altitude)))}%
            </p>
          </div>
          <div className="graph-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={data.slice(-100)}
                style={{ backgroundColor: chartConfig.background }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={chartConfig.gridColor}
                  vertical={false}
                />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatTime}
                  stroke={chartConfig.textColor}
                  tick={{ fill: chartConfig.textColor }}
                  axisLine={{ stroke: chartConfig.gridColor }}
                />
                <YAxis
                  stroke={chartConfig.textColor}
                  tick={{ fill: chartConfig.textColor }}
                  axisLine={{ stroke: chartConfig.gridColor }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartConfig.tooltipBackground,
                    border: `1px solid ${chartConfig.tooltipBorder}`,
                    borderRadius: '4px',
                    color: '#ffffff'
                  }}
                  labelFormatter={formatTime}
                  formatter={(value: number) => [formatValue(value), 'Altitude (m)']}
                />
                <Line
                  type="monotone"
                  dataKey="altitude"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="metric-card">
          <p className="metric-title">Aceleração</p>
          <p className="metric-value">{formatValue(data[data.length - 1]?.acceleration || 0)} m/s²</p>
          <div className="flex gap-1">
            <p className="metric-subtitle">Últimos 10 segundos</p>
            <p className={`metric-change ${getChangePercentage(data.map(d => d.acceleration)) >= 0 ? 'positive' : 'negative'}`}>
              {formatValue(getChangePercentage(data.map(d => d.acceleration)))}%
            </p>
          </div>
          <div className="graph-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={data.slice(-100)}
                style={{ backgroundColor: chartConfig.background }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={chartConfig.gridColor}
                  vertical={false}
                />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatTime}
                  stroke={chartConfig.textColor}
                  tick={{ fill: chartConfig.textColor }}
                  axisLine={{ stroke: chartConfig.gridColor }}
                />
                <YAxis
                  stroke={chartConfig.textColor}
                  tick={{ fill: chartConfig.textColor }}
                  axisLine={{ stroke: chartConfig.gridColor }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartConfig.tooltipBackground,
                    border: `1px solid ${chartConfig.tooltipBorder}`,
                    borderRadius: '4px',
                    color: '#ffffff'
                  }}
                  labelFormatter={formatTime}
                  formatter={(value: number) => [formatValue(value), 'Aceleração (m/s²)']}
                />
                <Line
                  type="monotone"
                  dataKey="acceleration"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="metric-card">
          <p className="metric-title">Pressão</p>
          <p className="metric-value">{formatValue(data[data.length - 1]?.pressure || 0)} kPa</p>
          <div className="flex gap-1">
            <p className="metric-subtitle">Últimos 10 segundos</p>
            <p className={`metric-change ${getChangePercentage(data.map(d => d.pressure)) >= 0 ? 'positive' : 'negative'}`}>
              {formatValue(getChangePercentage(data.map(d => d.pressure)))}%
            </p>
          </div>
          <div className="graph-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={data.slice(-100)}
                style={{ backgroundColor: chartConfig.background }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={chartConfig.gridColor}
                  vertical={false}
                />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatTime}
                  stroke={chartConfig.textColor}
                  tick={{ fill: chartConfig.textColor }}
                  axisLine={{ stroke: chartConfig.gridColor }}
                />
                <YAxis
                  stroke={chartConfig.textColor}
                  tick={{ fill: chartConfig.textColor }}
                  axisLine={{ stroke: chartConfig.gridColor }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartConfig.tooltipBackground,
                    border: `1px solid ${chartConfig.tooltipBorder}`,
                    borderRadius: '4px',
                    color: '#ffffff'
                  }}
                  labelFormatter={formatTime}
                  formatter={(value: number) => [formatValue(value), 'Pressão (kPa)']}
                />
                <Line
                  type="monotone"
                  dataKey="pressure"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="controls-container">
        <button
          className={`btn ${isLaunched ? 'btn-secondary' : 'btn-primary'}`}
          onClick={isLaunched ? handleStop : handleLaunch}
          disabled={isSaving}
        >
          {isLaunched ? 'Parar' : 'Lançar'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleSave}
          disabled={isSaving || data.length === 0}
        >
          Salvar Dados
        </button>
      </div>
    </div>
  );
}; 