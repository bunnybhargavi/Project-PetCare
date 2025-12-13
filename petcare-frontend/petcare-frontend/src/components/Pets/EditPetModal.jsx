import React, { useState, useEffect } from 'react';
import { X, Heart, Camera, Activity } from 'lucide-react';
import { healthService } from '../../services/healthService';

const EditPetModal = ({ isOpen, pet, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    gender: 'MALE',
    microchipId: '',
    dateOfBirth: '',
    notes: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [healthData, setHealthData] = useState({
    weight: '',
    temperature: '',
    measurementNotes: ''
  });
  const [addMeasurement, setAddMeasurement] = useState(false);

  useEffect(() => {
    if (pet) {
      setFormData({
        name: pet.name || '',
        species: pet.species || 'Dog',
        breed: pet.breed || '',
        gender: (pet.gender || 'MALE'),
        microchipId: pet.microchipId || '',
        dateOfBirth: pet.dateOfBirth || '',
        notes: pet.notes || '',
      });
      // Set existing photo as preview if available
      if (pet.photo) {
        setPhotoPreview(`http://localhost:8080${pet.photo}`);
      } else {
        setPhotoPreview(null);
      }
      setPhotoFile(null);
      setHealthData({ weight: '', temperature: '', measurementNotes: '' });
      setAddMeasurement(false);
    }
  }, [pet]);

  if (!isOpen) return null;

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    const payload = {
      name: formData.name,
      species: formData.species,
      breed: formData.breed,
      gender: formData.gender || 'UNKNOWN',
      microchipId: formData.microchipId || '',
      dateOfBirth: formData.dateOfBirth || null,
      notes: formData.notes || '',
    };

    // Update pet details and photo
    await onUpdate(pet.id, { petData: payload, photoFile });

    // Add health measurement if provided
    if (addMeasurement && (healthData.weight || healthData.temperature)) {
      try {
        const today = new Date().toISOString().split('T')[0];
        await healthService.createMeasurement(pet.id, {
          measurementDate: today,
          weight: healthData.weight ? parseFloat(healthData.weight) : null,
          temperature: healthData.temperature ? parseFloat(healthData.temperature) : null,
          notes: healthData.measurementNotes || ''
        });
      } catch (error) {
        console.error('Failed to add measurement:', error);
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 py-8 px-4 animate-fadeIn overflow-auto">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto animate-slideUp shadow-2xl my-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Heart className="text-white" size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Edit Pet</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Photo Upload - Circular with Preview */}
        <div className="flex justify-center mb-5">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <div className="w-28 h-28 rounded-full border-4 border-dashed border-purple-300 flex items-center justify-center bg-purple-50 hover:bg-purple-100 transition-all overflow-hidden">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <Camera className="text-purple-400 mx-auto mb-1" size={28} />
                  <div className="text-xs text-purple-600 font-medium">Add Photo</div>
                </div>
              )}
            </div>
          </label>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pet Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Species</label>
              <select
                value={formData.species}
                onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              >
                <option>Dog</option>
                <option>Cat</option>
                <option>Bird</option>
                <option>Rabbit</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Breed</label>
            <input
              type="text"
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="UNKNOWN">Unknown</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Microchip ID</label>
            <input
              type="text"
              value={formData.microchipId}
              onChange={(e) => setFormData({ ...formData, microchipId: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes</label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Health Measurements Section */}
          <div className="border-t-2 border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => setAddMeasurement(!addMeasurement)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3 hover:text-blue-600 transition-colors"
            >
              <Activity size={18} className="text-blue-500" />
              <span>{addMeasurement ? '− Hide' : '+ Add'} Current Health Measurements</span>
            </button>

            {addMeasurement && (
              <div className="space-y-3 bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                <p className="text-xs text-gray-600 mb-2">
                  Add today's weight and temperature measurements
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 25.5"
                      value={healthData.weight}
                      onChange={(e) => setHealthData({ ...healthData, weight: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Temperature (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 38.5"
                      value={healthData.temperature}
                      onChange={(e) => setHealthData({ ...healthData, temperature: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Measurement Notes (optional)
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Any observations..."
                    value={healthData.measurementNotes}
                    onChange={(e) => setHealthData({ ...healthData, measurementNotes: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-none text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-3">
            <button
              onClick={onClose}
              className="flex-1 px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Update Pet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPetModal;
