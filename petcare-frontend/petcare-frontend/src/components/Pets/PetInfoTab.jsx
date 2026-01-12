import React from 'react';
import { ClipboardList, StickyNote } from 'lucide-react';

const PetInfoTab = ({ pet, latestMeasurement }) => {
  return (
    <div className="animate-fadeIn space-y-6">
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Details Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-5">
            <ClipboardList className="text-gray-700" size={22} />
            <h3 className="text-lg font-bold text-gray-900">Basic Details</h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Gender</span>
              <span className="font-semibold text-gray-900 uppercase">{pet.gender || 'Unknown'}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Weight</span>
              <span className="font-semibold text-gray-900">
                {latestMeasurement?.weight != null ? `${latestMeasurement.weight} kg` : 'Not recorded'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Microchip ID</span>
              <span className="font-semibold text-gray-900">{pet.microchipId || 'Not registered'}</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Birthday</span>
              <span className="font-semibold text-gray-900">{pet.dateOfBirth || 'Unknown'}</span>
            </div>
          </div>
        </div>

        {/* Notes Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-5">
            <StickyNote className="text-gray-700" size={22} />
            <h3 className="text-lg font-bold text-gray-900">Notes</h3>
          </div>

          <div className="bg-yellow-50 rounded-xl p-4 min-h-[150px]">
            <p className="text-gray-700 leading-relaxed">
              {pet.notes || 'No notes added yet.'}
            </p>
          </div>
        </div>
      </div>

      {/* Optional: Species and Temperature info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <div className="text-sm text-purple-600 font-medium mb-1">Species</div>
          <div className="text-lg font-bold text-purple-900">{pet.species}</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <div className="text-sm text-blue-600 font-medium mb-1">Breed</div>
          <div className="text-lg font-bold text-blue-900">{pet.breed}</div>
        </div>
        <div className="bg-pink-50 rounded-xl p-4 text-center">
          <div className="text-sm text-pink-600 font-medium mb-1">Age</div>
          <div className="text-lg font-bold text-pink-900">
            {pet.age != null ? `${pet.age} ${pet.age === 1 ? 'year' : 'years'}` : 'Unknown'}
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-sm text-green-600 font-medium mb-1">Temperature</div>
          <div className="text-lg font-bold text-green-900">
            {latestMeasurement?.temperature != null ? `${latestMeasurement.temperature} °C` : 'Not recorded'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetInfoTab;
