import React, { useState } from 'react';
import { X, Stethoscope } from 'lucide-react';
import { medicalRecordService } from '../../services/medicalRecordService';

const recordTypes = [
  'CHECKUP',
  'VACCINATION',
  'SURGERY',
  'EMERGENCY',
  'TREATMENT',
  'LAB_TEST',
];

const AddMedicalRecordModal = ({ isOpen, petId, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    visitDate: new Date().toISOString().split('T')[0],
    recordType: 'CHECKUP',
    vetName: '',
    diagnosis: '',
    treatment: '',
    prescriptions: '',
    notes: '',
    attachment: null,
  });

  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const { attachment, ...payload } = formData;
      const record = await medicalRecordService.createRecord(petId, payload);
      if (attachment) {
        await medicalRecordService.uploadAttachment(petId, record.id, attachment);
      }
      onAdd();
    } catch (error) {
      console.error('Error adding medical record:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-3xl p-6 max-w-2xl w-full animate-slideUp my-8 max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
              <Stethoscope className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Add Medical Record</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Visit Date</label>
              <input
                type="date"
                value={formData.visitDate}
                onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Record Type</label>
              <select
                value={formData.recordType}
                onChange={(e) => setFormData({ ...formData, recordType: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm transition-colors"
              >
                {recordTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Vet Name</label>
              <input
                type="text"
                value={formData.vetName}
                onChange={(e) => setFormData({ ...formData, vetName: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm transition-colors"
                placeholder="Dr. Smith"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Diagnosis</label>
              <input
                type="text"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm transition-colors"
                placeholder="e.g., Checkup - Healthy"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Treatment</label>
              <textarea
                value={formData.treatment}
                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                rows="2"
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm resize-none transition-colors"
                placeholder="Procedures or care instructions"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Prescriptions</label>
              <textarea
                value={formData.prescriptions}
                onChange={(e) => setFormData({ ...formData, prescriptions: e.target.value })}
                rows="2"
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm resize-none transition-colors"
                placeholder="Medications prescribed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="2"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm resize-none transition-colors"
              placeholder="Additional observations..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Attachment (PDF/JPG/PNG)</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFormData({ ...formData, attachment: e.target.files?.[0] || null })}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="flex gap-3 pt-3 sticky bottom-0 bg-white pb-2">
            <button
              onClick={onClose}
              className="flex-1 px-5 py-2.5 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-70 transition-all text-sm"
            >
              {saving ? 'Saving...' : 'Add Record'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMedicalRecordModal;

