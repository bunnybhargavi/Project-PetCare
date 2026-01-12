import React, { useState } from 'react';
import { X, Bell } from 'lucide-react';
import { reminderService } from '../../services/reminderService';

const AddReminderModal = ({ isOpen, petId, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'VACCINATION',
    dueDate: new Date().toISOString().split('T')[0],
    isRecurring: false,
    repeatRule: 'YEARLY',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      setSaving(true);
      await reminderService.createReminder(petId, formData);
      onAdd();
    } catch (error) {
      console.error('Error adding reminder:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-3xl p-6 max-w-xl w-full animate-slideUp my-8 max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-3 border-b border-gray-100 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg shadow-orange-500/20">
              <Bell className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Add Reminder</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Reminder Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none text-sm font-medium transition-colors"
              placeholder="e.g., Rabies booster"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none text-sm font-medium transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none text-sm font-medium transition-colors bg-white"
              >
                <option value="VACCINATION">💉 Vaccination</option>
                <option value="CHECKUP">🩺 Checkup</option>
                <option value="MEDICATION">💊 Medication</option>
                <option value="GROOMING">✂️ Grooming</option>
                <option value="DEWORMING">🪱 Deworming</option>
                <option value="CUSTOM">📝 Custom</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                  <input
                    type="checkbox"
                    id="recurring-toggle"
                    className="absolute w-0 h-0 opacity-0"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  />
                  <label
                    htmlFor="recurring-toggle"
                    className={`block h-6 overflow-hidden rounded-full cursor-pointer transition-colors duration-300 ${formData.isRecurring ? 'bg-yellow-500' : 'bg-gray-300'
                      }`}
                  ></label>
                  <div
                    className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-300 ${formData.isRecurring ? 'translate-x-6' : 'translate-x-0'
                      }`}
                  />
                </div>
                <label htmlFor="recurring-toggle" className="text-sm font-bold text-gray-700 cursor-pointer select-none">
                  Repeat Reminder
                </label>
              </div>
              {formData.isRecurring && (
                <span className="text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-lg">
                  Recurring Enabled
                </span>
              )}
            </div>

            {formData.isRecurring && (
              <div className="mt-3 animate-fadeIn">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Repeat Every</label>
                <div className="grid grid-cols-3 gap-2">
                  {['WEEKLY', 'MONTHLY', 'YEARLY'].map((rule) => (
                    <button
                      key={rule}
                      type="button"
                      onClick={() => setFormData({ ...formData, repeatRule: rule })}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${formData.repeatRule === rule
                          ? 'bg-yellow-500 text-white shadow-md shadow-yellow-500/30'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-yellow-500'
                        }`}
                    >
                      {rule.charAt(0) + rule.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none text-sm font-medium transition-colors resize-none"
              rows="3"
              placeholder="Add any additional details or instructions..."
            />
          </div>

          <div className="flex gap-3 pt-3 sticky bottom-0 bg-white pb-2 z-10 border-t border-gray-100 mt-2">
            <button
              onClick={onClose}
              className="flex-1 px-5 py-3 border-2 border-gray-200 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all text-sm text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 px-5 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-70 transition-all text-sm transform hover:-translate-y-0.5"
            >
              {saving ? 'Scheduling...' : 'Create Reminder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddReminderModal;