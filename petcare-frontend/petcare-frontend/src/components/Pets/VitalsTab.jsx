import React, { useState } from 'react';
import { Weight, Thermometer, Activity, TrendingUp, BarChart3, LineChart } from 'lucide-react';

const VitalsTab = ({ measurements }) => {
  const [selectedType, setSelectedType] = useState('WEIGHT');
  const [chartType, setChartType] = useState('line'); // 'line' or 'bar'

  const latestMeasurement = measurements.length > 0 ? measurements[0] : null;

  const vitalCards = [
    {
      icon: Weight,
      label: 'Weight',
      value: latestMeasurement?.weight ? `${latestMeasurement.weight} kg` : 'N/A',
      color: 'pink',
      type: 'WEIGHT',
    },
    {
      icon: Thermometer,
      label: 'Temperature',
      value: latestMeasurement?.temperature ? `${latestMeasurement.temperature}°C` : 'N/A',
      color: 'red',
      type: 'TEMPERATURE',
    },
  ];

  const colorClasses = {
    pink: 'from-pink-50 to-red-50 text-pink-600',
    red: 'from-red-50 to-orange-50 text-red-600',
  };

  const getBarValue = (m) => {
    if (selectedType === 'WEIGHT') return m.weight || 0;
    if (selectedType === 'TEMPERATURE') return m.temperature || 0;
    return 0;
  };

  const chartData = measurements
    .slice(0, 12)
    .reverse()
    .map(m => ({
      date: m.measurementDate,
      value: getBarValue(m),
      id: m.id
    }))
    .filter(d => d.value !== null && d.value !== 0);

  const maxValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) : 0;
  const minValue = chartData.length > 0 ? Math.min(...chartData.map(d => d.value)) : 0;

  // Calculate trend
  const trendPercentage = chartData.length >= 2
    ? ((chartData[chartData.length - 1].value - chartData[0].value) / chartData[0].value * 100).toFixed(1)
    : 0;
  const isIncreasing = trendPercentage > 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Latest Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vitalCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${colorClasses[card.color]} p-5 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 ${selectedType === card.type ? 'border-blue-500' : 'border-transparent'}`}
              onClick={() => setSelectedType(card.type)}
            >
              <div className="flex items-center gap-3 mb-3">
                <Icon size={24} />
                <span className="text-sm font-semibold text-gray-700">{card.label}</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">{card.value}</p>
              {latestMeasurement && (
                <p className="text-xs text-gray-500 mt-2">
                  {latestMeasurement.measurementDate}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" />
            Health Trend - {selectedType === 'WEIGHT' ? 'Weight' : 'Temperature'}
          </h4>
          <div className="flex gap-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm"
            >
              <option value="WEIGHT">Weight</option>
              <option value="TEMPERATURE">Temperature</option>
            </select>
            <div className="flex gap-1 border-2 border-gray-200 rounded-xl p-1">
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1.5 rounded-lg transition-all ${chartType === 'line' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <LineChart size={16} />
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1.5 rounded-lg transition-all ${chartType === 'bar' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <BarChart3 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Trend Summary */}
        {chartData.length >= 2 && (
          <div className={`mb-4 p-3 rounded-xl ${isIncreasing ? 'bg-green-50 border-2 border-green-200' : 'bg-blue-50 border-2 border-blue-200'}`}>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className={isIncreasing ? 'text-green-600' : 'text-blue-600 transform rotate-180'} />
              <span className="text-sm font-semibold text-gray-700">
                Trend: {isIncreasing ? '↑' : '↓'} {Math.abs(trendPercentage)}% {isIncreasing ? 'increase' : 'decrease'} over time
              </span>
            </div>
          </div>
        )}

        {measurements.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Activity size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-semibold">No measurements recorded yet</p>
            <p className="text-sm mt-2">Add measurements to see health trends</p>
          </div>
        ) : chartType === 'line' ? (
          <LineChartComponent data={chartData} maxValue={maxValue} minValue={minValue} type={selectedType} />
        ) : (
          <BarChartComponent data={chartData} maxValue={maxValue} />
        )}
      </div>
    </div>
  );
};

// Line Chart Component
const LineChartComponent = ({ data, maxValue, minValue, type }) => {
  if (data.length === 0) return <div className="text-center py-10 text-gray-500">No data available</div>;

  const chartHeight = 250;
  const chartWidth = 600;
  const padding = 40;
  const innerHeight = chartHeight - padding * 2;
  const innerWidth = chartWidth - padding * 2;

  const xStep = data.length > 1 ? innerWidth / (data.length - 1) : 0;
  const yRange = maxValue - minValue || 1;

  const points = data.map((d, i) => {
    const x = padding + (i * xStep);
    const y = padding + innerHeight - ((d.value - minValue) / yRange * innerHeight);
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="overflow-x-auto">
      <svg width={chartWidth} height={chartHeight} className="mx-auto">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + innerHeight * (1 - ratio);
          const value = (minValue + yRange * ratio).toFixed(1);
          return (
            <g key={i}>
              <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#e5e7eb" strokeWidth="1" />
              <text x={padding - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#6b7280">
                {value}
              </text>
            </g>
          );
        })}

        {/* Line path */}
        <path d={pathD} fill="none" stroke="url(#lineGradient)" strokeWidth="3" />

        {/* Gradient */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>

        {/* Data points */}
        {points.map((p) => (
          <g key={p.id}>
            <circle
              cx={p.x}
              cy={p.y}
              r="5"
              fill="#ffffff"
              stroke="#3b82f6"
              strokeWidth="3"
              className="hover:r-7 transition-all cursor-pointer"
            />
            <title>{`${p.date}: ${p.value} ${type === 'WEIGHT' ? 'kg' : '°C'}`}</title>
          </g>
        ))}

        {/* X-axis labels */}
        {points.map((p, i) => {
          if (i % Math.ceil(points.length / 6) === 0 || i === points.length - 1) {
            return (
              <text key={`label-${i}`} x={p.x} y={chartHeight - padding + 20} textAnchor="middle" fontSize="10" fill="#6b7280">
                {p.date}
              </text>
            );
          }
          return null;
        })}
      </svg>
    </div>
  );
};

// Bar Chart Component
const BarChartComponent = ({ data, maxValue }) => {
  return (
    <div className="h-64 flex items-end gap-2">
      {data.map((d) => {
        const height = maxValue ? (d.value / maxValue) * 100 : 0;
        return (
          <div key={d.id} className="flex-1 flex flex-col items-center group min-w-[32px]">
            <div
              className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 relative"
              style={{ height: `${height}%` }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {d.value || 'N/A'}
              </div>
            </div>
            <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
              {d.date}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default VitalsTab;