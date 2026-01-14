import React, { useState } from 'react';
import { X, Camera, PawPrint } from 'lucide-react';

const AddPetModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    dateOfBirth: '',
    gender: 'MALE',
    microchipId: '',
    notes: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Name must not exceed 100 characters';
    }
    
    // Species validation
    if (!formData.species.trim()) {
      newErrors.species = 'Species is required';
    }
    
    // Breed validation (optional but if provided, check length)
    if (formData.breed && formData.breed.length > 100) {
      newErrors.breed = 'Breed must not exceed 100 characters';
    }
    
    // Date of birth validation (optional but if provided, check it's not in future)
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      if (birthDate > today) {
        newErrors.dateOfBirth = 'Birth date cannot be in the future';
      }
    }
    
    // Microchip ID validation (optional but if provided, check format)
    if (formData.microchipId && formData.microchipId.length > 50) {
      newErrors.microchipId = 'Microchip ID must not exceed 50 characters';
    }
    
    // Notes validation
    if (formData.notes && formData.notes.length > 1000) {
      newErrors.notes = 'Notes must not exceed 1000 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    const payload = {
      name: formData.name,
      species: formData.species,
      breed: formData.breed || '',
      dateOfBirth: formData.dateOfBirth || null,
      gender: formData.gender || 'UNKNOWN',
      microchipId: formData.microchipId || '',
      notes: formData.notes || '',
    };
    onAdd({ petData: payload, photoFile });
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '', species: 'Dog', breed: '', dateOfBirth: '', gender: 'MALE', microchipId: '', notes: '',
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setErrors({});
    onClose();
  };

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

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 py-8 px-4 animate-fadeIn overflow-auto"
      style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="bg-white rounded-3xl p-6 w-full max-w-sm max-h-[85vh] overflow-y-auto animate-slideUp relative shadow-2xl my-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-700 flex items-center gap-2">
            Add New Pet <PawPrint size={20} className="text-pink-500" />
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Photo Upload - Circular Placeholder */}
        <div className="flex justify-center mb-5">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <div className="w-28 h-28 rounded-full border-4 border-dashed border-pink-300 flex items-center justify-center bg-pink-50 hover:bg-pink-100 transition-all overflow-hidden">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <Camera className="text-pink-400 mx-auto mb-1" size={28} />
                  <div className="text-xs text-pink-600 font-medium">Add Photo</div>
                </div>
              )}
            </div>
          </label>
        </div>

        {/* Form */}
        <div className="space-y-3">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Name
            </label>
            <input
              type="text"
              placeholder="e.g. Bella"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none transition-colors ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
                }`}
            />
            {errors.name && <p className="text-xs mt-1 text-red-500">{errors.name}</p>}
          </div>

          {/* Species and Breed */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Species
              </label>
              <select
                value={formData.species}
                onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
              >
                <option value="Dog">🐶 Dog</option>
                <option value="Cat">🐱 Cat</option>
                <option value="Bird">🐦 Bird</option>
                <option value="Rabbit">🐰 Rabbit</option>
                <option value="Hamster">🐹 Hamster</option>
                <option value="Other">🐾 Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Breed
              </label>
              <input
                type="text"
                placeholder="e.g. Beagle"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                maxLength="100"
                className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none transition-colors ${
                  errors.breed ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
                }`}
              />
              {errors.breed && <p className="text-xs mt-1 text-red-500">{errors.breed}</p>}
            </div>
          </div>

          {/* Birthday and Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Birthday
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none transition-colors ${
                  errors.dateOfBirth ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
                }`}
              />
              {errors.dateOfBirth && <p className="text-xs mt-1 text-red-500">{errors.dateOfBirth}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
              >
                <option value="MALE">♂️ Male</option>
                <option value="FEMALE">♀️ Female</option>
                <option value="UNKNOWN">⚪ Unknown</option>
              </select>
            </div>
          </div>

          {/* Microchip ID */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Microchip ID (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 123456789012345"
              value={formData.microchipId}
              onChange={(e) => setFormData({ ...formData, microchipId: e.target.value })}
              maxLength="50"
              className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none transition-colors ${
                errors.microchipId ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
              }`}
            />
            {errors.microchipId && <p className="text-xs mt-1 text-red-500">{errors.microchipId}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              placeholder="Any special needs or information..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="2"
              maxLength="1000"
              className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none resize-none transition-colors ${
                errors.notes ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.notes && <p className="text-xs text-red-500">{errors.notes}</p>}
              <p className="text-xs text-gray-500 ml-auto">{formData.notes.length}/1000</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              onClick={handleClose}
              className="flex-1 px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
            >
              Save New Pet
            </button>
          </div>
        </div>

        {/* Animation Styles */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
          .animate-slideUp {
            animation: slideUp 0.4s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default AddPetModal;

