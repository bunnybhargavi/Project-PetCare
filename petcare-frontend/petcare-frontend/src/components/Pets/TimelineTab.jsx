import React from 'react';
import { Stethoscope, Syringe, Plus, Calendar } from 'lucide-react';

const TimelineTab = ({ medicalRecords, vaccinations, onAddVaccination, onRefresh }) => {
  const allEvents = [
    ...medicalRecords.map(r => ({ ...r, type: 'medical', date: r.date })),
    ...vaccinations.map(v => ({ ...v, type: 'vaccination', date: v.date })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-4 animate-fadeIn">
      {allEvents.length === 0 ? (
        <div className="text-center py-20">
          <Calendar className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No records yet</h3>
          <p className="text-gray-600 mb-6">Start tracking your pet's health journey</p>
          <button
            onClick={onAddVaccination}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Plus size={18} className="inline mr-2" />
            Add First Record
          </button>
        </div>
      ) : (
        allEvents.map((event, index) => (
          <div
            key={`${event.type}-${event.id}`}
            className={`flex gap-4 p-5 rounded-2xl transition-all duration-300 hover:shadow-md ${
              event.type === 'medical'
                ? 'bg-blue-50 hover:bg-blue-100'
                : 'bg-green-50 hover:bg-green-100'
            }`}
          >
            <div
              className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center shadow-md ${
                event.type === 'medical' ? 'bg-blue-500' : 'bg-green-500'
              }`}
            >
              {event.type === 'medical' ? (
                <Stethoscope className="text-white" size={24} />
              ) : (
                <Syringe className="text-white" size={24} />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">
                    {event.type === 'medical' ? event.type : `${event.name} Vaccination`}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {event.type === 'medical' ? event.diagnosis : `Next due: ${event.nextDue}`}
                  </p>
                  {event.type === 'medical' && event.treatment && (
                    <p className="text-sm text-gray-500 mt-2">{event.treatment}</p>
                  )}
                </div>
                <span className="text-xs font-semibold text-gray-500 bg-white px-3 py-1 rounded-full">
                  {event.date}
                </span>
              </div>
              {event.veterinarian && (
                <p className="text-xs text-gray-500 mt-2">Dr. {event.veterinarian}</p>
              )}
              {event.administeredBy && (
                <p className="text-xs text-gray-500 mt-2">By: {event.administeredBy}</p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TimelineTab;