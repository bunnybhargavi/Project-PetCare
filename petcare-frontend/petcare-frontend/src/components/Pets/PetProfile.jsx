import React, { useState, useEffect } from 'react';
import { X, Heart, Calendar, Activity, FileText, Plus } from 'lucide-react';
import { medicalRecordService } from '../../services/medicalRecordService';
import { vaccinationService } from '../../services/vaccinationService';
import { healthService } from '../../services/healthService';
import { reminderService } from '../../services/reminderService';
import PetInfoTab from './PetInfoTab';
import TimelineTab from './TimelineTab';
import VitalsTab from './VitalsTab';
import DocumentsTab from './DocumentsTab';
import AddMedicalRecordModal from './AddMedicalRecordModal';
import AddVaccinationModal from './AddVaccinationModal';
import AddMeasurementModal from './AddMeasurementModal';
import AddReminderModal from './AddReminderModal';

const PetProfile = ({ pet, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showVaccinationModal, setShowVaccinationModal] = useState(false);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);

  useEffect(() => {
    if (pet) {
      loadPetData();
    }
  }, [pet]);

  const loadPetData = async () => {
    setLoading(true);
    try {
      const [recordsData, vaccinationsData, measurementsData, remindersData] = await Promise.all([
        medicalRecordService.getRecordsByPet(pet.id),
        vaccinationService.getVaccinationsByPet(pet.id),
        healthService.getMeasurementsByPet(pet.id),
        reminderService.getRemindersByPet(pet.id),
      ]);

      setMedicalRecords(recordsData);
      setVaccinations(vaccinationsData);
      setMeasurements(measurementsData);
      setReminders(remindersData);
    } catch (error) {
      console.error('Error loading pet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'info', label: 'Info', icon: Heart },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'vitals', label: 'Vitals', icon: Activity },
    { id: 'documents', label: 'Documents', icon: FileText },
  ];

  const getAddButtonConfig = () => {
    switch (activeTab) {
      case 'timeline':
        return { label: 'Add Record', onClick: () => setShowRecordModal(true) };
      case 'vitals':
        return { label: 'Add Measurement', onClick: () => setShowMeasurementModal(true) };
      case 'documents':
        return { label: 'Add Reminder', onClick: () => setShowReminderModal(true) };
      default:
        return null;
    }
  };

  const addButtonConfig = getAddButtonConfig();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden animate-slideUp shadow-2xl">
        {/* Header with Gradient */}
        <div className="relative h-64 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 overflow-hidden">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-all backdrop-blur-sm z-10"
          >
            <X size={24} />
          </button>

          {/* Pet Info */}
          <div className="absolute -bottom-16 left-8 flex items-end gap-6 z-10">
            <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl bg-white overflow-hidden">
              {pet.imageUrl ? (
                <img
                  src={pet.imageUrl}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                  <Heart className="text-purple-400" size={48} />
                </div>
              )}
            </div>
            <div className="pb-4">
              <h1 className="text-4xl font-bold text-white mb-2">{pet.name}</h1>
              <p className="text-white/90 text-lg">
                {pet.breed} • {pet.age} {pet.age === 1 ? 'year' : 'years'} old
              </p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-10 right-20 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-1/3 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Tabs */}
        <div className="mt-20 px-8 border-b border-gray-200 flex justify-between items-center">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-semibold transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-lg -mb-px'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Add Button */}
          {addButtonConfig && (
            <button
              onClick={addButtonConfig.onClick}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 mb-2"
            >
              <Plus size={18} />
              {addButtonConfig.label}
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-8 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 400px)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {activeTab === 'info' && <PetInfoTab pet={pet} />}
              {activeTab === 'timeline' && (
                <TimelineTab
                  medicalRecords={medicalRecords}
                  vaccinations={vaccinations}
                  onAddVaccination={() => setShowVaccinationModal(true)}
                  onRefresh={loadPetData}
                />
              )}
              {activeTab === 'vitals' && (
                <VitalsTab measurements={measurements} petId={pet.id} />
              )}
              {activeTab === 'documents' && (
                <DocumentsTab reminders={reminders} onRefresh={loadPetData} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showRecordModal && (
        <AddMedicalRecordModal
          isOpen={showRecordModal}
          petId={pet.id}
          onClose={() => setShowRecordModal(false)}
          onAdd={() => {
            setShowRecordModal(false);
            loadPetData();
          }}
        />
      )}

      {showVaccinationModal && (
        <AddVaccinationModal
          isOpen={showVaccinationModal}
          petId={pet.id}
          onClose={() => setShowVaccinationModal(false)}
          onAdd={() => {
            setShowVaccinationModal(false);
            loadPetData();
          }}
        />
      )}

      {showMeasurementModal && (
        <AddMeasurementModal
          isOpen={showMeasurementModal}
          petId={pet.id}
          onClose={() => setShowMeasurementModal(false)}
          onAdd={() => {
            setShowMeasurementModal(false);
            loadPetData();
          }}
        />
      )}

      {showReminderModal && (
        <AddReminderModal
          isOpen={showReminderModal}
          petId={pet.id}
          onClose={() => setShowReminderModal(false)}
          onAdd={() => {
            setShowReminderModal(false);
            loadPetData();
          }}
        />
      )}

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
  );
};

export default PetProfile;