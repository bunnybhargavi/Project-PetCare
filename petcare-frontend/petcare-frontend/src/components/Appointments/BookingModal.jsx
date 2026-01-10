import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { appointmentService } from '../../services/appointmentService';
import { petService } from '../../services/petService';
import { vetService } from '../../services/vetService';

const BookingModal = ({ onClose, preSelectedVet = null }) => {
    const [step, setStep] = useState(preSelectedVet ? 2 : 1);
    const [pets, setPets] = useState([]);
    const [vets, setVets] = useState([]);
    const [selectedPetId, setSelectedPetId] = useState('');
    const [selectedVet, setSelectedVet] = useState(preSelectedVet);
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPets = async () => {
            try {
                const data = await petService.getAllPets();
                setPets(Array.isArray(data) ? data : []);
                if (data && data.length > 0) setSelectedPetId(data[0].id);
            } catch (err) {
                console.error(err);
                setError('Failed to load pets');
            }
        };
        fetchPets();

        if (!preSelectedVet) {
            const fetchVets = async () => {
                try {
                    const data = await vetService.listAll();
                    setVets(Array.isArray(data) ? data : []);
                } catch (err) {
                    console.error('Failed to load vets:', err);
                    setVets([]);
                }
            };
            fetchVets();
        }
    }, [preSelectedVet]);

    // Fetch slots when vet is selected (or pre-selected)
    useEffect(() => {
        if (selectedVet && step === 2) {
            const loadSlots = async () => {
                setLoading(true);
                try {
                    const data = await appointmentService.getAvailableSlots(selectedVet.id);
                    setSlots(data || []);
                } catch (e) { console.error(e); }
                setLoading(false);
            };
            loadSlots();
        }
    }, [selectedVet, step]);

    const handleVetSelect = (vet) => {
        setSelectedVet(vet);
        setStep(2);
    };

    const handleBook = async () => {
        if (!selectedPetId) return alert("Please select a pet");
        if (!selectedVet) return alert("Please select a veterinarian");

        setLoading(true);
        try {
            await appointmentService.bookAppointment({
                petId: selectedPetId,
                slotId: selectedSlot?.id,
                veterinarianId: selectedVet.id,
                dateTime: new Date().toISOString(), // Fallback if no slot
                type: selectedSlot?.mode === 'IN_CLINIC' ? 'IN_CLINIC' : 'TELECONSULT', // Default logic
                reason
            });
            alert('Appointment Requested Successfully! Status: PENDING. Please wait for Vet approval.');
            onClose();
        } catch (e) {
            alert('Booking Failed: ' + (e.response?.data?.message || e.message));
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Book Appointment</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors">
                        <FaTimes size={24} />
                    </button>
                </div>

                {step === 1 && !preSelectedVet && (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Select a Veterinarian</h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {vets.map(vet => (
                                <div key={vet.id} onClick={() => handleVetSelect(vet)}
                                    className="p-4 border rounded-xl hover:bg-blue-50 hover:border-blue-400 cursor-pointer transition-all flex justify-between items-center group">
                                    <div>
                                        <div className="font-bold text-gray-800">{vet.clinicName}</div>
                                        <div className="text-sm text-gray-600">{vet.name || vet.user?.name}</div>
                                        <div className="text-xs text-blue-500 mt-1">{vet.specialization}</div>
                                    </div>
                                    <span className="text-blue-600 opacity-0 group-hover:opacity-100 font-semibold">Select &rarr;</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(step === 2 || preSelectedVet) && (
                    <div className="space-y-6">
                        {!preSelectedVet && (
                            <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-800 mb-2">
                                &larr; Change Veterinarian
                            </button>
                        )}

                        <div className="bg-blue-50 p-4 rounded-xl">
                            <span className="text-xs font-bold text-blue-600 uppercase">Booking with</span>
                            <h3 className="font-bold text-xl text-gray-800">{selectedVet?.clinicName}</h3>
                            <p className="text-sm text-gray-600">Dr. {selectedVet?.name || selectedVet?.user?.name}</p>
                        </div>

                        {/* Pet Selection */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">Select Pet</label>
                            {pets.length === 0 ? (
                                <p className="text-red-500 text-sm">Please add a pet in your dashboard first.</p>
                            ) : (
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {pets.map(pet => (
                                        <div key={pet.id}
                                            onClick={() => setSelectedPetId(pet.id)}
                                            className={`flex-shrink-0 p-3 border-2 rounded-xl cursor-pointer min-w-[100px] text-center transition-all ${selectedPetId === pet.id ? 'border-purple-500 bg-purple-50' : 'border-gray-100 hover:border-gray-300'
                                                }`}>
                                            <div className="font-bold text-gray-800">{pet.name}</div>
                                            <div className="text-xs text-gray-500">{pet.species}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Slot Selection */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">Available Slots</label>
                            {loading ? <div className="text-center py-4 text-gray-500">Loading slots...</div> : (
                                <div className="grid grid-cols-3 gap-2">
                                    {slots.length === 0 && (
                                        <div className="col-span-3 text-center py-4 text-gray-500 italic">
                                            No specific slots available.
                                        </div>
                                    )}
                                    {slots.map((slot) => (
                                        <div key={slot.id}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`p-2 border rounded-lg text-center text-sm cursor-pointer transition-all ${selectedSlot === slot ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'border-gray-200 hover:bg-gray-50'
                                                }`}>
                                            {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            <div className="text-[10px] opacity-75">{slot.mode}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <textarea
                            placeholder="Reason for visit (optional)..."
                            className="w-full border-2 border-gray-100 rounded-xl p-3 focus:outline-none focus:border-blue-500 transition-colors"
                            rows="3"
                            value={reason} onChange={e => setReason(e.target.value)}
                        />

                        <button
                            onClick={handleBook}
                            disabled={loading || !selectedPetId || (slots.length > 0 && !selectedSlot)}
                            className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all ${loading || !selectedPetId || (slots.length > 0 && !selectedSlot)
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-1'
                                }`}>
                            {loading ? 'Booking...' : 'Confirm Appointment'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingModal;
