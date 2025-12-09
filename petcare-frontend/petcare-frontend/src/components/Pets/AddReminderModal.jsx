import React, { useState } from 'react';
import { X, Bell } from 'lucide-react';
import { reminderService } from '../../services/reminderService';

const AddReminderModal = ({ isOpen, petId, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'APPOINTMENT',
  });

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      await reminderService.createReminder({
        ...formData,
        petId,
        completed: false,
      });
      onAdd();
    } catch (error) {
      console.error('Error adding reminder:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full animate-slideUp">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500 rounded-xl">
              <Bell className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold">Add Reminder</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none"
              placeholder="e.g., Vet Appointment"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none"
              rows="3"
              placeholder="Additional details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none"
              >
                <option value="APPOINTMENT">Appointment</option>
                <option value="MEDICATION">Medication</option>
                <option value="GROOMING">Grooming</option>
                <option value="VACCINATION">Vaccination</option>
                <option value="OTHER">Other</option>
              </select>
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg"
            >
              Add Reminder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddReminderModal;