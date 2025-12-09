import React, { useState } from 'react';
import { X, Heart, Sparkles } from 'lucide-react';

const AddPetModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    age: '',
    gender: 'Male',
    weight: '',
    color: '',
    microchipId: '',
    dateOfBirth: '',
    imageUrl: '',
    ownerId: 1,
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.breed.trim()) newErrors.breed = 'Breed is required';
    if (!formData.age || formData.age <= 0) newErrors.age = 'Valid age is required';
    if (formData.weight && formData.weight <= 0) newErrors.weight = 'Weight must be positive';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const petData = {
        ...formData,
        age: parseInt(formData.age),
        weight: formData.weight ? parseFloat(formData.weight) : null,
      };
      onAdd(petData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '', species: 'Dog', breed: '', age: '', gender: 'Male',
      weight: '', color: '', microchipId: '', dateOfBirth: '', imageUrl: '', ownerId: 1,
    });
    setErrors({});
    onClose();
  };

  const getSpeciesEmoji = (species) => {
    const emojis = {
      'Dog': '🐶', 'Cat': '🐱', 'Bird': '🐦', 'Rabbit': '🐰',
      'Hamster': '🐹', 'Guinea Pig': '🐹', 'Other': '🐾'
    };
    return emojis[species] || '🐾';
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fadeIn"
      style={{ background: 'rgba(139, 71, 137, 0.4)', backdropFilter: 'blur(10px)' }}
    >
      <div 
        className="rounded-3xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-slideUp relative"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 245, 240, 0.95) 100%)',
          boxShadow: '0 20px 60px rgba(255, 179, 217, 0.4)',
          border: '3px solid rgba(255, 179, 217, 0.3)'
        }}
      >
        {/* Decorative Elements */}
        <div className="paw-print" style={{ top: '20px', right: '80px', fontSize: '60px', opacity: '0.1' }}>🐾</div>
        <div className="paw-print" style={{ bottom: '20px', left: '80px', fontSize: '50px', opacity: '0.1' }}>🐾</div>

        {/* Header */}
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex items-center gap-4">
            <div 
              className="p-4 rounded-2xl animate-pulse-gentle"
              style={{
                background: 'linear-gradient(135deg, #FFD4C3 0%, #FFB3D9 100%)',
                boxShadow: '0 4px 20px rgba(255, 179, 217, 0.4)'
              }}
            >
              <Heart className="text-white" size={32} />
            </div>
            <div>
              <h2 
                className="text-3xl font-bold flex items-center gap-2"
                style={{ fontFamily: 'Fredoka, sans-serif', color: '#8B4789' }}
              >
                Add New Pet
                <Sparkles className="text-pink-400 animate-bounce-gentle" size={28} />
              </h2>
              <p style={{ color: '#D64A94', fontFamily: 'Fredoka, sans-serif' }}>
                Let's welcome a new family member! 💕
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-pink-100 rounded-full transition-all hover:rotate-90 duration-300"
            style={{ color: '#D64A94' }}
          >
            <X size={28} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-5 relative z-10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label 
                className="block text-sm font-semibold mb-2"
                style={{ color: '#8B4789', fontFamily: 'Fredoka, sans-serif' }}
              >
                Pet Name ✨ *
              </label>
              <input
                type="text"
                placeholder="Enter adorable name..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl transition-all"
                style={{
                  border: errors.name ? '2px solid #FFB5A0' : '2px solid #FFD4C3',
                  background: 'rgba(255, 255, 255, 0.9)',
                  fontFamily: 'Inter, sans-serif'
                }}
              />
              {errors.name && <p className="text-xs mt-1" style={{ color: '#D66B4A' }}>{errors.name}</p>}
            </div>

            <div>
              <label 
                className="block text-sm font-semibold mb-2"
                style={{ color: '#8B4789', fontFamily: 'Fredoka, sans-serif' }}
              >
                Species {getSpeciesEmoji(formData.species)} *
              </label>
              <select
                value={formData.species}
                onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                className="w-full px-4 py-3 rounded-xl transition-all"
                style={{
                  border: '2px solid #E0BBE4',
                  background: 'rgba(255, 255, 255, 0.9)',
                  fontFamily: 'Fredoka, sans-serif',
                  color: '#8B4789'
                }}
              >
                <option value="Dog">🐶 Dog</option>
                <option value="Cat">🐱 Cat</option>
                <option value="Bird">🐦 Bird</option>
                <option value="Rabbit">🐰 Rabbit</option>
                <option value="Hamster">🐹 Hamster</option>
                <option value="Guinea Pig">🐹 Guinea Pig</option>
                <option value="Other">🐾 Other</option>
              </select>
            </div>
          </div>

          <div>
            <label 
              className="block text-sm font-semibold mb-2"
              style={{ color: '#8B4789', fontFamily: 'Fredoka, sans-serif' }}
            >
              Breed 🎨 *
            </label>
            <input
              type="text"
              placeholder="Enter breed..."
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              className="w-full px-4 py-3 rounded-xl transition-all"
              style={{
                border: errors.breed ? '2px solid #FFB5A0' : '2px solid #FFD4C3',
                background: 'rgba(255, 255, 255, 0.9)',
                fontFamily: 'Inter, sans-serif'
              }}
            />
            {errors.breed && <p className="text-xs mt-1" style={{ color: '#D66B4A' }}>{errors.breed}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label 
                className="block text-sm font-semibold mb-2"
                style={{ color: '#8B4789', fontFamily: 'Fredoka, sans-serif' }}
              >
                Age 🎂 *
              </label>
              <input
                type="number"
                placeholder="0"
                min="0"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-4 py-3 rounded-xl transition-all"
                style={{
                  border: errors.age ? '2px solid #FFB5A0' : '2px solid #FFF9C4',
                  background: 'rgba(255, 255, 255, 0.9)',
                  fontFamily: 'Inter, sans-serif'
                }}
              />
              {errors.age && <p className="text-xs mt-1" style={{ color: '#D66B4A' }}>{errors.age}</p>}
            </div>

            <div>
              <label 
                className="block text-sm font-semibold mb-2"
                style={{ color: '#8B4789', fontFamily: 'Fredoka, sans-serif' }}
              >
                Gender {formData.gender === 'Male' ? '♂️' : '♀️'} *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-3 rounded-xl transition-all"
                style={{
                  border: formData.gender === 'Male' ? '2px solid #C3E5FF' : '2px solid #FFB3D9',
                  background: 'rgba(255, 255, 255, 0.9)',
                  fontFamily: 'Fredoka, sans-serif',
                  color: '#8B4789'
                }}
              >
                <option value="Male">♂️ Male</option>
                <option value="Female">♀️ Female</option>
              </select>
            </div>

            <div>
              <label 
                className="block text-sm font-semibold mb-2"
                style={{ color: '#8B4789', fontFamily: 'Fredoka, sans-serif' }}
              >
                Weight (kg) ⚖️
              </label>
              <input
                type="number"
                placeholder="0.0"
                min="0"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-4 py-3 rounded-xl transition-all"
                style={{
                  border: '2px solid #D5F4E6',
                  background: 'rgba(255, 255, 255, 0.9)',
                  fontFamily: 'Inter, sans-serif'
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label 
                className="block text-sm font-semibold mb-2"
                style={{ color: '#8B4789', fontFamily: 'Fredoka, sans-serif' }}
              >
                Color 🎨
              </label>
              <input
                type="text"
                placeholder="Pet color..."
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-4 py-3 rounded-xl transition-all"
                style={{
                  border: '2px solid #FFD4C3',
                  background: 'rgba(255, 255, 255, 0.9)',
                  fontFamily: 'Inter, sans-serif'
                }}
              />
            </div>

            <div>
              <label 
                className="block text-sm font-semibold mb-2"
                style={{ color: '#8B4789', fontFamily: 'Fredoka, sans-serif' }}
              >
                Date of Birth 📅
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-4 py-3 rounded-xl transition-all"
                style={{
                  border: '2px solid #E0BBE4',
                  background: 'rgba(255, 255, 255, 0.9)',
                  fontFamily: 'Inter, sans-serif'
                }}
              />
            </div>
          </div>

          <div>
            <label 
              className="block text-sm font-semibold mb-2"
              style={{ color: '#8B4789', fontFamily: 'Fredoka, sans-serif' }}
            >
              Microchip ID 🔖
            </label>
            <input
              type="text"
              placeholder="Enter microchip ID..."
              value={formData.microchipId}
              onChange={(e) => setFormData({ ...formData, microchipId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl transition-all"
              style={{
                border: '2px solid #C3E5FF',
                background: 'rgba(255, 255, 255, 0.9)',
                fontFamily: 'Inter, sans-serif'
              }}
            />
          </div>

          <div>
            <label 
              className="block text-sm font-semibold mb-2"
              style={{ color: '#8B4789', fontFamily: 'Fredoka, sans-serif' }}
            >
              Image URL 📸
            </label>
            <input
              type="url"
              placeholder="https://example.com/pet-photo.jpg"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-4 py-3 rounded-xl transition-all"
              style={{
                border: '2px solid #D5F4E6',
                background: 'rgba(255, 255, 255, 0.9)',
                fontFamily: 'Inter, sans-serif'
              }}
            />
            <p className="text-xs mt-1" style={{ color: '#D64A94' }}>
              Optional: Add a photo URL for your pet 💕
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-4 rounded-xl font-semibold transition-all hover:scale-105"
              style={{
                border: '2px solid #E0BBE4',
                color: '#8B4789',
                background: 'rgba(255, 255, 255, 0.9)',
                fontFamily: 'Fredoka, sans-serif'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-4 rounded-xl font-semibold transition-all hover:scale-105 wiggle-on-hover"
              style={{
                background: 'linear-gradient(135deg, #FFD4C3 0%, #FFB3D9 100%)',
                color: '#8B4789',
                boxShadow: '0 4px 20px rgba(255, 179, 217, 0.4)',
                fontFamily: 'Fredoka, sans-serif'
              }}
            >
              Add Pet 🐾
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPetModal;