import React, { useState, useEffect } from 'react';
import { X, Heart, Calendar, Activity, FileText, Plus, Edit2 } from 'lucide-react';
import { medicalRecordService } from '../../services/medicalRecordService';
import { vaccinationService } from '../../services/vaccinationService';
import { healthService } from '../../services/healthService';
import { reminderService } from '../../services/reminderService';
import { petService } from '../../services/petService';
import PetInfoTab from './PetInfoTab';
import TimelineTab from './TimelineTab';
import VitalsTab from './VitalsTab';
import DocumentsTab from './DocumentsTab';
import AddMedicalRecordModal from './AddMedicalRecordModal';
import AddVaccinationModal from './AddVaccinationModal';
import AddMeasurementModal from './AddMeasurementModal';
import AddReminderModal from './AddReminderModal';
import EditPetModal from './EditPetModal';

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
  const [showEditModal, setShowEditModal] = useState(false);

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 py-8 px-4 animate-fadeIn overflow-auto">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-hidden animate-slideUp shadow-2xl my-auto">
        {/* Header with Pink-Purple Gradient */}
        <div className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-purple-400 px-6 pt-6 pb-16">
          {/* Close Button - Top Right Corner */}
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all"
            >
              <X size={18} className="text-white" />
            </button>
          </div>

          {/* Pet Photo and Info Container */}
          <div className="flex items-start gap-4">
            {/* Circular Pet Photo */}
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl bg-white overflow-hidden flex-shrink-0">
              {pet.photo ? (
                <img
                  src={`http://localhost:8080${pet.photo}`}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
                  <Heart className="text-purple-400" size={36} />
                </div>
              )}
            </div>

            {/* Pet Name and Details - Takes Available Space */}
            <div className="flex-1 min-w-0 pr-2">
              <h1 className="text-xl font-bold text-white mb-1 truncate">{pet.name}</h1>
              <p className="text-white/90 text-sm">
                {pet.breed} • {pet.age ? `${pet.age} ${pet.age === 1 ? 'year' : 'years'} old` : 'Age unknown'}
              </p>
            </div>

            {/* Edit Profile Button */}
            <button
              onClick={() => setShowEditModal(true)}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all shadow-lg text-xs whitespace-nowrap flex-shrink-0 mr-8"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Tabs - Positioned below gradient header */}
        <div className="px-6 border-b border-gray-200 bg-white -mt-6 relative z-20">
          <div className="flex gap-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 font-semibold transition-all duration-200 border-b-2 text-sm ${activeTab === tab.id
                    ? 'text-purple-600 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700 border-transparent'
                    }`}
                >
                  {tab.label.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 320px)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {activeTab === 'info' && (
                <PetInfoTab
                  pet={pet}
                  latestMeasurement={
                    measurements && measurements.length
                      ? [...measurements].sort((a, b) => new Date(b.measurementDate) - new Date(a.measurementDate))[0]
                      : null
                  }
                />
              )}
              {activeTab === 'timeline' && (
                <TimelineTab
                  medicalRecords={medicalRecords}
                  vaccinations={vaccinations}
                  onAddMedicalRecord={() => setShowRecordModal(true)}
                  onAddVaccination={() => setShowVaccinationModal(true)}
                  onRefresh={loadPetData}
                />
              )}
              {activeTab === 'vitals' && <VitalsTab measurements={measurements} />}
              {activeTab === 'documents' && (
                <DocumentsTab
                  reminders={reminders}
                  petId={pet.id}
                  onRefresh={loadPetData}
                  onAddReminder={() => setShowReminderModal(true)}
                />
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

      {showEditModal && (
        <EditPetModal
          isOpen={showEditModal}
          pet={pet}
          onClose={() => setShowEditModal(false)}
          onUpdate={async (id, payload) => {
            await petService.updatePet(id, payload.petData);
            if (payload.photoFile) {
              await petService.uploadPetImage(id, payload.photoFile);
            }
            setShowEditModal(false);
            await onUpdate?.();
            await loadPetData();
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
