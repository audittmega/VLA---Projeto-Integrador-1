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
  const [selectedRange, setSelectedRange] = useState<10 | 20 | 30>(10);
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
      // 1. Chama o ESP para lançar
      const espResponse = await fetch('http://192.168.4.1/launch', {
        method: 'GET',
      });
      if (!espResponse.ok) {
        throw new Error('Falha ao iniciar o lançamento no ESP');
      }
    } catch (error) {
      // Apenas loga, não bloqueia o lançamento
      console.warn('Erro ao iniciar o lançamento no ESP: ' + (error as Error).message);
    }

    // 2. Espera 3,5 segundos
    await new Promise(resolve => setTimeout(resolve, 3500));

    // 3. Inicia os dados mockados
    launchRocket(selectedRange);
    setIsLaunched(true);
    setData([]);
  }, [selectedRange]);

  const handleStop = useCallback(async () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsLaunched(false);
    stopRocket(); // Garante que o mock pare de gerar dados
    // Não limpe setData([]) aqui!
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

  // Helper to map backend data to chart data
  const mapBackendData = (backendData: any[]): ProcessedData[] => {
    return backendData.map(item => ({
      altitude: item.altitude,
      pressure: item.pressure,
      acceleration: item.accZ, // Use accZ for acceleration
      timestamp: item.timestamp,
      roll: item.roll,
      pitch: item.pitch,
    }));
  };

  // Fetch data from backend
  const fetchBackendData = async () => {
    try {
      const response = await fetch('http://localhost:8089/api/VLA/listar');
      if (!response.ok) {
        throw new Error('Erro ao buscar dados do backend');
      }
      const backendData = await response.json();
      setData(mapBackendData(backendData));
    } catch (error) {
      alert('Erro ao buscar dados do backend: ' + (error as Error).message);
    }
  };

  // Fetch mock data periodically when launched
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isLaunched) {
      setData(getCurrentData());
      interval = setInterval(() => {
        setData(getCurrentData());
      }, 1000);
      setIntervalId(interval);
    } else {
      // Não limpe setData([]) aqui!
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLaunched]);

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
      <div className="controls-container" style={{ marginBottom: 16 }}>
        <label style={{ color: '#fff', marginRight: 8 }}>Alcance do lançamento:</label>
        <select
          value={selectedRange}
          onChange={e => setSelectedRange(Number(e.target.value) as 10 | 20 | 30)}
          style={{ padding: 4, borderRadius: 4 }}
        >
          <option value={10}>10 metros</option>
          <option value={20}>20 metros</option>
          <option value={30}>30 metros</option>
        </select>
      </div>
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