import React, { useState } from 'react';
import { X, Syringe } from 'lucide-react';
import { vaccinationService } from '../../services/vaccinationService';

const AddVaccinationModal = ({ isOpen, petId, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    vaccineName: '',
    dateGiven: new Date().toISOString().split('T')[0],
    nextDueDate: '',
    batchNumber: '',
    veterinarianName: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      setSaving(true);
      await vaccinationService.createVaccination(petId, formData);
      onAdd();
    } catch (error) {
      console.error('Error adding vaccination:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-3xl w-full animate-slideUp">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500 rounded-xl">
              <Syringe className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold">Add Vaccination</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Vaccine Name</label>
              <input
                type="text"
                value={formData.vaccineName}
                onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                placeholder="Rabies"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date Given</label>
              <input
                type="date"
                value={formData.dateGiven}
                onChange={(e) => setFormData({ ...formData, dateGiven: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Next Due Date</label>
              <input
                type="date"
                value={formData.nextDueDate}
                onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Number</label>
              <input
                type="text"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                placeholder="Batch #"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Veterinarian</label>
              <input
                type="text"
                value={formData.veterinarianName}
                onChange={(e) => setFormData({ ...formData, veterinarianName: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                placeholder="Dr. Lee"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                placeholder="Any observations..."
              />
            </div>
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
              disabled={saving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-70"
            >
              {saving ? 'Saving...' : 'Add Vaccination'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVaccinationModal;

