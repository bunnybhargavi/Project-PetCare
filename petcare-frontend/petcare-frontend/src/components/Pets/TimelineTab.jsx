import React, { useMemo, useState } from 'react';
import { Stethoscope, Syringe, Plus, Calendar } from 'lucide-react';

const TimelineTab = ({ medicalRecords, vaccinations, onAddMedicalRecord, onAddVaccination }) => {
  const [filterType, setFilterType] = useState('ALL');

  const events = useMemo(() => [
    ...medicalRecords.map((r) => ({
      id: r.id,
      kind: 'medical',
      title: r.recordType,
      description: r.diagnosis || r.treatment || r.notes,
      date: r.visitDate,
      vet: r.vetName,
      attachmentUrl: r.attachmentUrl,
    })),
    ...vaccinations.map((v) => ({
      id: v.id,
      kind: 'vaccination',
      title: `${v.vaccineName} vaccination`,
      description: v.notes,
      date: v.dateGiven,
      nextDueDate: v.nextDueDate,
      vet: v.veterinarianName,
    })),
  ], [medicalRecords, vaccinations]);

  const filtered = useMemo(() => {
    let list = events;
    if (filterType !== 'ALL') {
      list = list.filter((e) => (filterType === 'MEDICAL' ? e.kind === 'medical' : e.kind === 'vaccination'));
    }
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [events, filterType]);

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${filterType === 'ALL'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 border-2 border-blue-400'
              : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 shadow-md'
              }`}
          >
            <span className="mr-1.5">📋</span>
            All ({events.length})
          </button>
          <button
            onClick={() => setFilterType('MEDICAL')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${filterType === 'MEDICAL'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50 border-2 border-blue-400'
              : 'bg-white text-gray-700 hover:bg-blue-50 border-2 border-blue-100 hover:border-blue-300 shadow-md'
              }`}
          >
            <span className="mr-1.5">🩺</span>
            Medical ({medicalRecords.length})
          </button>
          <button
            onClick={() => setFilterType('VACCINATION')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${filterType === 'VACCINATION'
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50 border-2 border-green-400'
              : 'bg-white text-gray-700 hover:bg-green-50 border-2 border-green-100 hover:border-green-300 shadow-md'
              }`}
          >
            <span className="mr-1.5">💉</span>
            Vaccinations ({vaccinations.length})
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onAddMedicalRecord}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-xl shadow-lg shadow-blue-500/30 text-sm flex items-center gap-2 transition-all duration-300 transform hover:scale-105 border-2 border-blue-400"
          >
            <Stethoscope size={18} /> Add Medical Record
          </button>
          <button
            onClick={onAddVaccination}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-xl shadow-lg shadow-purple-500/30 text-sm flex items-center gap-2 transition-all duration-300 transform hover:scale-105 border-2 border-purple-400"
          >
            <Syringe size={18} /> Add Vaccination
          </button>
        </div>
      </div>
      {events.length === 0 ? (
        <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl">
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
        <div className="space-y-3">
          {filtered.map((event) => (
            <div
              key={`${event.kind}-${event.id}`}
              className={`group relative flex gap-4 p-5 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] ${event.kind === 'medical'
                ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:border-blue-400'
                : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:border-green-400'
                }`}
            >
              {/* Left Color Bar */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${event.kind === 'medical' ? 'bg-gradient-to-b from-blue-500 to-cyan-500' : 'bg-gradient-to-b from-green-500 to-emerald-500'
                  }`}
              />

              {/* Icon */}
              <div
                className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${event.kind === 'medical'
                  ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                  : 'bg-gradient-to-br from-green-500 to-emerald-500'
                  }`}
              >
                {event.kind === 'medical' ? (
                  <Stethoscope className="text-white" size={24} />
                ) : (
                  <Syringe className="text-white" size={24} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-bold text-gray-900 text-lg">
                    {event.title}
                  </h4>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 ${event.kind === 'medical'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-green-100 text-green-700 border border-green-200'
                    }`}>
                    {event.date}
                  </span>
                </div>

                {event.description && (
                  <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-3 mt-3">
                  {event.vet && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-white px-3 py-1.5 rounded-full border border-gray-200">
                      <span className="text-base">👨‍⚕️</span>
                      <span className="font-medium">Dr. {event.vet}</span>
                    </div>
                  )}

                  {event.kind === 'vaccination' && event.nextDueDate && (
                    <div className="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
                      <Calendar size={14} />
                      <span className="font-medium">Next: {event.nextDueDate}</span>
                    </div>
                  )}

                  {event.attachmentUrl && (
                    <a
                      href={event.attachmentUrl.startsWith('http') ? event.attachmentUrl : `http://localhost:8080${event.attachmentUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      <span>📎</span>
                      <span className="font-medium">View attachment</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimelineTab;
