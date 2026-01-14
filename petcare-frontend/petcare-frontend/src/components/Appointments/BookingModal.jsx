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
                    // If vet has created slots, use them; otherwise use default slots
                    if (data && data.length > 0) {
                        setSlots(data);
                    } else {
                        // Generate default time slots
                        setSlots(generateDefaultSlots());
                    }
                } catch (e) { 
                    console.error(e);
                    // On error, use default slots
                    setSlots(generateDefaultSlots());
                }
                setLoading(false);
            };
            loadSlots();
        }
    }, [selectedVet, step]);

    // Generate default time slots (Morning, Afternoon, Evening)
    const generateDefaultSlots = () => {
        const defaultSlots = [];
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0); // Start of tomorrow
        
        // Morning slots (9 AM - 12 PM)
        for (let hour = 9; hour <= 11; hour++) {
            const slotTime = new Date(tomorrow);
            slotTime.setHours(hour, 0, 0, 0);
            
            defaultSlots.push({
                id: `default-morning-${hour}`,
                startTime: slotTime.toISOString(),
                endTime: new Date(slotTime.getTime() + 60 * 60 * 1000).toISOString(),
                mode: 'IN_CLINIC',
                capacity: 5,
                bookedCount: 0,
                status: 'AVAILABLE',
                isDefault: true,
                period: 'Morning'
            });
        }
        
        // Afternoon slots (2 PM - 5 PM)
        for (let hour = 14; hour <= 16; hour++) {
            const slotTime = new Date(tomorrow);
            slotTime.setHours(hour, 0, 0, 0);
            
            defaultSlots.push({
                id: `default-afternoon-${hour}`,
                startTime: slotTime.toISOString(),
                endTime: new Date(slotTime.getTime() + 60 * 60 * 1000).toISOString(),
                mode: 'IN_CLINIC',
                capacity: 5,
                bookedCount: 0,
                status: 'AVAILABLE',
                isDefault: true,
                period: 'Afternoon'
            });
        }
        
        // Evening slots (6 PM - 8 PM)
        for (let hour = 18; hour <= 19; hour++) {
            const slotTime = new Date(tomorrow);
            slotTime.setHours(hour, 0, 0, 0);
            
            defaultSlots.push({
                id: `default-evening-${hour}`,
                startTime: slotTime.toISOString(),
                endTime: new Date(slotTime.getTime() + 60 * 60 * 1000).toISOString(),
                mode: 'IN_CLINIC',
                capacity: 5,
                bookedCount: 0,
                status: 'AVAILABLE',
                isDefault: true,
                period: 'Evening'
            });
        }

        return defaultSlots;
    };

    const handleVetSelect = (vet) => {
        setSelectedVet(vet);
        setStep(2);
    };

    const handleBook = async () => {
        if (!selectedPetId) return alert("Please select a pet");
        if (!selectedVet) return alert("Please select a veterinarian");
        if (!selectedSlot) return alert("Please select a time slot");
        
        // Validate reason if provided
        if (reason && reason.trim().length > 0 && reason.trim().length < 5) {
            return alert("Reason must be at least 5 characters long");
        }
        if (reason && reason.trim().length > 500) {
            return alert("Reason must not exceed 500 characters");
        }

        setLoading(true);
        try {
            const appointmentData = {
                petId: parseInt(selectedPetId),
                veterinarianId: selectedVet.id,
                type: selectedSlot?.mode === 'TELECONSULT' ? 'TELECONSULT' : 'IN_CLINIC',
                dateTime: selectedSlot.startTime // Always include dateTime
            };
            
            // Only add slot ID if it's a real vet-created slot (not default)
            if (selectedSlot && !selectedSlot.isDefault && typeof selectedSlot.id === 'number') {
                appointmentData.slotId = parseInt(selectedSlot.id);
            }
            
            // Add reason if provided and valid
            if (reason && reason.trim().length >= 5) {
                appointmentData.reason = reason.trim();
            }
            
            console.log('Booking appointment with data:', appointmentData);
            
            await appointmentService.bookAppointment(appointmentData);
            alert('✅ Appointment Requested Successfully!\n\nStatus: PENDING\nPlease wait for veterinarian approval.');
            onClose();
        } catch (e) {
            console.error('Booking error:', e);
            console.error('Error response:', e.response?.data);
            const errorMessage = e.response?.data?.message || e.message || 'Unknown error occurred';
            alert('❌ Booking Failed:\n\n' + errorMessage + '\n\nPlease try again.');
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
                                <>
                                    {slots.length === 0 ? (
                                        <div className="text-center py-4 text-gray-500 italic">
                                            No slots available.
                                        </div>
                                    ) : (
                                        <>
                                            {/* Show info about slot types */}
                                            {slots.every(s => s.isDefault) && (
                                                <div className="mb-3 p-2 bg-blue-50 rounded-lg text-xs text-blue-700">
                                                    📅 Default time slots available
                                                </div>
                                            )}
                                            {slots.some(s => s.isDefault) && slots.some(s => !s.isDefault) && (
                                                <div className="mb-3 p-2 bg-blue-50 rounded-lg text-xs text-blue-700">
                                                    💡 Showing both vet-created and default slots
                                                </div>
                                            )}
                                            
                                            <div className="grid grid-cols-3 gap-2">
                                                {slots.map((slot) => (
                                                    <div key={slot.id}
                                                        onClick={() => setSelectedSlot(slot)}
                                                        className={`p-2 border rounded-lg text-center text-sm cursor-pointer transition-all ${selectedSlot === slot ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'border-gray-200 hover:bg-gray-50'
                                                            }`}>
                                                        <div className="font-semibold">
                                                            {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                        </div>
                                                        <div className={`text-[10px] ${selectedSlot === slot ? 'text-blue-100' : 'text-gray-500'}`}>
                                                            {slot.isDefault ? `📅 ${slot.period}` : `👨‍⚕️ ${slot.mode}`}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">
                                Reason for visit (optional)
                                {reason && reason.trim().length > 0 && (
                                    <span className={`ml-2 text-xs ${
                                        reason.trim().length < 5 ? 'text-red-500' : 
                                        reason.trim().length > 500 ? 'text-red-500' : 'text-green-500'
                                    }`}>
                                        {reason.trim().length < 5 ? `Need ${5 - reason.trim().length} more characters` :
                                         reason.trim().length > 500 ? `${reason.trim().length - 500} characters over limit` :
                                         `${reason.trim().length}/500 characters`}
                                    </span>
                                )}
                            </label>
                            <textarea
                                placeholder="Describe your pet's symptoms or reason for the visit (minimum 5 characters if provided)..."
                                className={`w-full border-2 rounded-xl p-3 focus:outline-none transition-colors ${
                                    reason && reason.trim().length > 0 && (reason.trim().length < 5 || reason.trim().length > 500) 
                                        ? 'border-red-300 focus:border-red-500' 
                                        : 'border-gray-100 focus:border-blue-500'
                                }`}
                                rows="3"
                                value={reason} 
                                onChange={e => setReason(e.target.value)}
                                maxLength={520} // Allow a bit over to show error
                            />
                        </div>

                        <button
                            onClick={handleBook}
                            disabled={loading || !selectedPetId || (slots.length > 0 && !selectedSlot) || 
                                     (reason && reason.trim().length > 0 && (reason.trim().length < 5 || reason.trim().length > 500))}
                            className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                                loading || !selectedPetId || (slots.length > 0 && !selectedSlot) ||
                                (reason && reason.trim().length > 0 && (reason.trim().length < 5 || reason.trim().length > 500))
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
