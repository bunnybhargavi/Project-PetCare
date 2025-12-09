import React, { useState, useEffect } from 'react';
import { Weight, Thermometer, Activity, TrendingUp } from 'lucide-react';
import { healthService } from '../../services/healthService';

const VitalsTab = ({ measurements, petId }) => {
  const [selectedType, setSelectedType] = useState('WEIGHT');

  const latestMeasurement = measurements.length > 0 ? measurements[0] : null;

  const vitalCards = [
    {
      icon: Weight,
      label: 'Weight',
      value: latestMeasurement?.weight ? `${latestMeasurement.weight} kg` : 'N/A',
      color: 'pink',
      type: 'WEIGHT'
    },
    {
      icon: Thermometer,
      label: 'Temperature',
      value: latestMeasurement?.temperature ? `${latestMeasurement.temperature}°C` : 'N/A',
      color: 'red',
      type: 'TEMPERATURE'
    },
    {
      icon: Activity,
      label: 'Heart Rate',
      value: latestMeasurement?.heartRate ? `${latestMeasurement.heartRate} bpm` : 'N/A',
      color: 'purple',
      type: 'HEART_RATE'
    },
  ];

  const colorClasses = {
    pink: 'from-pink-50 to-red-50 text-pink-600',
    red: 'from-red-50 to-orange-50 text-red-600',
    purple: 'from-purple-50 to-pink-50 text-purple-600',
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Latest Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {vitalCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${colorClasses[card.color]} p-5 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer`}
              onClick={() => setSelectedType(card.type)}
            >
              <div className="flex items-center gap-3 mb-3">
                <Icon size={24} />
                <span className="text-sm font-semibold text-gray-700">{card.label}</span>
              </div>
              <p className="text-3xl font-bold text-gray-800">{card.value}</p>
              {latestMeasurement && (
                <p className="text-xs text-gray-500 mt-2">{latestMeasurement.date}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-gray-50 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <TrendingUp size={20} />
            Health Trend
          </h4>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          >
            <option value="WEIGHT">Weight</option>
            <option value="TEMPERATURE">Temperature</option>
            <option value="HEART_RATE">Heart Rate</option>
          </select>
        </div>

        {measurements.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No measurements recorded yet
          </div>
        ) : (
          <div className="h-64 flex items-end gap-2">
            {measurements.slice(0, 10).reverse().map((m, index) => {
              let value = 0;
              if (selectedType === 'WEIGHT') value = m.weight || 0;
              else if (selectedType === 'TEMPERATURE') value = m.temperature || 0;
              else if (selectedType === 'HEART_RATE') value = m.heartRate || 0;

              const maxValue = Math.max(...measurements.map(m => {
                if (selectedType === 'WEIGHT') return m.weight || 0;
                if (selectedType === 'TEMPERATURE') return m.temperature || 0;
                return m.heartRate || 0;
              }));

              const height = (value / maxValue) * 100;

              return (
                <div key={m.id} className="flex-1 flex flex-col items-center group">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 relative"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {value}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{m.date}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default VitalsTab;