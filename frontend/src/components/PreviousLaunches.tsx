import React from 'react';
import { SavedLaunch } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getSavedLaunches } from '../api/mockApi';
import '../styles/PreviousLaunches.css';

const PreviousLaunches: React.FC = () => {
  const [launches, setLaunches] = React.useState<SavedLaunch[]>([]);
  const [selectedLaunch, setSelectedLaunch] = React.useState<SavedLaunch | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('http://localhost:8089/api/VLA/listarLancamentos')
      .then((response) => {
        if (!response.ok) throw new Error('Erro ao buscar lançamentos');
        return response.json();
      })
      .then((data) => {
        // Map API response to SavedLaunch[] (without data field)
        const mapped = data.map((item: any) => ({
          id: item.idLancamento,
          name: item.nome,
          date: item.dataLancamento,
          data: [] // Placeholder, since API does not provide detailed data
        }));
        setLaunches(mapped);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const chartConfig = {
    background: '#1a1f24',
    gridColor: '#2b3640',
    textColor: '#9daebe',
    tooltipBackground: '#2b3640',
    tooltipBorder: '#3d4d5c'
  };

  const formatTime = (timestamp: number) => {
    if (!selectedLaunch || !selectedLaunch.data.length) return '';
    const startTime = selectedLaunch.data[0].timestamp;
    return `${((timestamp - startTime) / 1000).toFixed(1)}s`;
  };

  const formatValue = (value: number) => {
    return value.toFixed(2);
  };

  return (
    <div className="previous-launches">
      <h1>Lançamentos Anteriores</h1>
      <div className="launches-container">
        <div className="launches-list">
          {loading && <p>Carregando lançamentos...</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && launches.map((launch) => (
            <div
              key={launch.id}
              className={`launch-item ${selectedLaunch?.id === launch.id ? 'selected' : ''}`}
              onClick={() => setSelectedLaunch(launch)}
            >
              <h3>{launch.name}</h3>
              <p>{new Date(launch.date).toLocaleDateString()}</p>
            </div>
          ))}
          {!loading && !error && launches.length === 0 && (
            <p className="no-launches">Nenhum lançamento salvo ainda.</p>
          )}
        </div>
        
        {selectedLaunch && (
          <div className="launch-details">
            <h2>{selectedLaunch.name}</h2>
            <p>Data: {new Date(selectedLaunch.date).toLocaleString()}</p>
            
            <div className="graphs">
              <div className="graph-container">
                <h3>Altitude</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart 
                    data={selectedLaunch.data}
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

              <div className="graph-container">
                <h3>Pressão</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart 
                    data={selectedLaunch.data}
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

              <div className="graph-container">
                <h3>Aceleração</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart 
                    data={selectedLaunch.data}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviousLaunches; 