import React, { useState } from 'react';
import { Calendar, Weight, Edit2, Trash2, Heart, Sparkles } from 'lucide-react';

const PetCard = ({ pet, onSelect, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getSpeciesEmoji = (species) => {
    const emojis = {
      'Dog': '🐶',
      'Cat': '🐱',
      'Bird': '🐦',
      'Rabbit': '🐰',
      'Hamster': '🐹',
      'Guinea Pig': '🐹',
      'Other': '🐾'
    };
    return emojis[species] || '🐾';
  };

  const getGenderColor = (gender) => {
    const g = (gender || '').toUpperCase();
    if (g === 'MALE') return { bg: '#C3E5FF', text: '#4A7BA8', label: 'Male', symbol: '♂️' };
    if (g === 'FEMALE') return { bg: '#FFB3D9', text: '#D64A94', label: 'Female', symbol: '♀️' };
    return { bg: '#E5E7EB', text: '#374151', label: 'Unknown', symbol: '⚪' };
  };

  const genderColor = getGenderColor(pet.gender);

  return (
    <div
      className="relative rounded-3xl overflow-hidden cursor-pointer transform transition-all duration-300 hover-lift card-pastel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(pet)}
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        boxShadow: isHovered
          ? '0 15px 35px rgba(0, 0, 0, 0.15)'
          : '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}
    >
      {/* Paw Print Decoration */}
      <div className="paw-print" style={{ top: '10px', right: '10px', fontSize: '40px' }}>
        🐾
      </div>
      <div className="paw-print" style={{ bottom: '10px', left: '10px', fontSize: '30px' }}>
        🐾
      </div>

      {/* Pet Image */}
      <div className="relative h-56 overflow-hidden bg-gray-100">
        {pet.photo ? (
          <img
            src={`http://localhost:8080${pet.photo}`}
            alt={pet.name}
            className="w-full h-full object-cover transition-transform duration-500"
            style={{
              transform: isHovered ? 'scale(1.1) rotate(2deg)' : 'scale(1)'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="text-8xl animate-bounce-gentle">
              {getSpeciesEmoji(pet.species)}
            </div>
          </div>
        )}

        {/* Subtle Gradient Overlay for text readability */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to top, rgba(0, 0, 0, 0.1) 0%, transparent 50%)',
            opacity: isHovered ? 0.2 : 0
          }}
        />

        {/* Action Buttons */}
        <div
          className="absolute top-4 right-4 flex gap-2 transition-all duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(-10px)'
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(pet);
            }}
            className="p-2.5 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '2px solid #C3E5FF',
              color: '#4A7BA8',
              boxShadow: '0 4px 12px rgba(195, 229, 255, 0.4)'
            }}
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(pet.id);
            }}
            className="p-2.5 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '2px solid #FFB5A0',
              color: '#D66B4A',
              boxShadow: '0 4px 12px rgba(255, 181, 160, 0.4)'
            }}
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Species Badge */}
        <div
          className="absolute top-4 left-4 px-4 py-2 rounded-full backdrop-blur-sm transition-all duration-300 badge-pastel"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            border: '2px solid #D5F4E6',
            color: '#2D8B5F',
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.9)',
            boxShadow: '0 4px 12px rgba(213, 244, 230, 0.4)',
            fontFamily: 'Fredoka, sans-serif',
            fontWeight: '600'
          }}
        >
          {getSpeciesEmoji(pet.species)} {pet.species}
        </div>

        {/* Sparkle Decoration */}
        {isHovered && (
          <Sparkles
            className="absolute bottom-4 right-4 text-white animate-pulse-gentle"
            size={28}
            style={{ filter: 'drop-shadow(0 2px 4px rgba(255, 179, 217, 0.6))' }}
          />
        )}
      </div>

      {/* Pet Info */}
      <div className="p-6" style={{ background: 'rgba(255, 255, 255, 0.6)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3
            className="text-2xl font-bold truncate"
            style={{
              fontFamily: 'Fredoka, sans-serif',
              color: '#8B4789'
            }}
          >
            {pet.name} {isHovered && '💕'}
          </h3>
          <span
            className="px-4 py-1.5 rounded-full text-sm font-semibold badge-pastel"
            style={{
              background: genderColor.bg,
              color: genderColor.text,
              fontFamily: 'Fredoka, sans-serif',
              border: `2px solid ${genderColor.text}20`
            }}
          >
            {genderColor.symbol} {genderColor.label}
          </span>
        </div>

        <p
          className="text-base mb-4 truncate"
          style={{
            color: '#D64A94',
            fontWeight: '500'
          }}
        >
          {pet.breed}
        </p>

        <div className="flex items-center gap-4 text-sm">
          <span
            className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
            style={{
              background: '#FFF9C4',
              color: '#D4A017',
              fontWeight: '600',
              border: '2px solid #D4A01730'
            }}
          >
            <Calendar size={16} />
            <span>{pet.age} {pet.age === 1 ? 'year' : 'years'}</span>
          </span>

        </div>

        {/* Hover Effect Line */}
        <div
          className="mt-5 h-1.5 rounded-full transition-all duration-500"
          style={{
            background: 'linear-gradient(90deg, #60A5FA 0%, #34D399 50%, #A78BFA 100%)',
            width: isHovered ? '100%' : '0%'
          }}
        />

        {/* Love Badge */}
        {isHovered && (
          <div
            className="absolute -top-3 -right-3 animate-bounce-gentle"
            style={{
              background: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)',
              padding: '8px',
              borderRadius: '50%',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
            }}
          >
            <Heart className="text-white" size={20} fill="white" />
          </div>
        )}
      </div>
    </div>
  );
};

export default PetCard;
