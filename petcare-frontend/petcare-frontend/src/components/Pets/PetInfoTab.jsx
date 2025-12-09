import React from 'react';
import { Calendar, Weight, MapPin, Hash, Palette } from 'lucide-react';

const PetInfoTab = ({ pet }) => {
  const infoCards = [
    { icon: Weight, label: 'Weight', value: pet.weight ? `${pet.weight} kg` : 'Not recorded', color: 'blue' },
    { icon: Calendar, label: 'Age', value: `${pet.age} years`, color: 'purple' },
    { icon: Palette, label: 'Color', value: pet.color || 'Not specified', color: 'pink' },
    { icon: Hash, label: 'Microchip', value: pet.microchipId || 'Not registered', color: 'green' },
  ];

  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 text-blue-600',
    purple: 'from-purple-50 to-purple-100 text-purple-600',
    pink: 'from-pink-50 to-pink-100 text-pink-600',
    green: 'from-green-50 to-green-100 text-green-600',
  };

  return (
    <div className="animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {infoCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${colorClasses[card.color]} p-6 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-4 bg-white rounded-xl shadow-md`}>
                  <Icon className={`${colorClasses[card.color].split(' ')[1]}`} size={28} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-gray-50 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Additional Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Species:</span>
            <span className="ml-2 font-semibold text-gray-800">{pet.species}</span>
          </div>
          <div>
            <span className="text-gray-600">Gender:</span>
            <span className="ml-2 font-semibold text-gray-800">{pet.gender}</span>
          </div>
          <div>
            <span className="text-gray-600">Breed:</span>
            <span className="ml-2 font-semibold text-gray-800">{pet.breed}</span>
          </div>
          {pet.dateOfBirth && (
            <div>
              <span className="text-gray-600">Date of Birth:</span>
              <span className="ml-2 font-semibold text-gray-800">{pet.dateOfBirth}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetInfoTab;