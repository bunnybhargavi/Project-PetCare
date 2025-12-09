import React, { useState } from 'react';
import { X, Activity } from 'lucide-react';
import { healthService } from '../../services/healthService';

const AddMeasurementModal = ({ isOpen, petId, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'WEIGHT',
    weight: '',
    temperature: '',
    heartRate: '',
    respiratoryRate: '',
    notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      await healthService.createMeasurement({
        ...formData,
        petId,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        heartRate: formData.heartRate ? parseInt(formData.heartRate) : null,
        respiratoryRate: formData.respiratoryRate ? parseInt(formData.respiratoryRate) : null,
      });
      onAdd();
    } catch (error) {
      console.error('Error adding measurement:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full animate-slideUp">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500 rounded-xl">
              <Activity className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold">Add Health Measurement</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
              >
                <option value="WEIGHT">Weight</option>
                <option value="TEMPERATURE">Temperature</option>
                <option value="HEART_RATE">Heart Rate</option>
                <option value="RESPIRATORY_RATE">Respiratory Rate</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                placeholder="e.g., 25.5"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                placeholder="e.g., 38.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Heart Rate (bpm)</label>
              <input
                type="number"
                value={formData.heartRate}
                onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                placeholder="e.g., 90"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Respiratory Rate</label>
              <input
                type="number"
                value={formData.respiratoryRate}
                onChange={(e) => setFormData({ ...formData, respiratoryRate: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                placeholder="e.g., 25"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
              rows="3"
              placeholder="Additional observations..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg"
            >
              Add Measurement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMeasurementModal;