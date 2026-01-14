import React, { useState, useEffect } from 'react';
import { vetService } from '../../services/vetService';
import { appointmentService } from '../../services/appointmentService';
import './VetSearchWithBooking.css';

const VetSearchWithBooking = ({ pets, ownerId }) => {
    const [searchParams, setSearchParams] = useState({
        specialization: '',
        location: '',
        teleconsultAvailable: null,
        date: '',
        appointmentType: ''
    });

    const [vetsWithSlots, setVetsWithSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedPet, setSelectedPet] = useState('');
    const [reason, setReason] = useState('');
    const [showBookingModal, setShowBookingModal] = useState(false);

    const handleSearch = async () => {
        try {
            setLoading(true);
            const data = await vetService.searchWithAvailability(searchParams);
            setVetsWithSlots(data);
        } catch (error) {
            console.error('Error searching vets:', error);
            alert('Failed to search vets');
        } finally {
            setLoading(false);
        }
    };

    const handleBookSlot = (slot, vet) => {
        setSelectedSlot({ ...slot, vet });
        setShowBookingModal(true);
    };

    const confirmBooking = async () => {
        if (!selectedPet) {
            alert('Please select a pet');
            return;
        }
        
        // Validate reason if provided
        if (reason && reason.trim().length > 0 && reason.trim().length < 5) {
            alert("Reason must be at least 5 characters long");
            return;
        }
        if (reason && reason.trim().length > 500) {
            alert("Reason must not exceed 500 characters");
            return;
        }

        try {
            const appointmentData = {
                petId: parseInt(selectedPet),
                veterinarianId: selectedSlot.veterinarianId,
                slotId: selectedSlot.id,
                type: selectedSlot.mode === 'BOTH' ?
                    (searchParams.appointmentType || 'IN_CLINIC') :
                    selectedSlot.mode
            };
            
            // Add reason if provided and valid
            if (reason && reason.trim().length >= 5) {
                appointmentData.reason = reason.trim();
            }

            await appointmentService.bookAppointment(appointmentData);

            alert('Appointment Requested! Status: PENDING. Vet approval required.');
            setShowBookingModal(false);
            setSelectedSlot(null);
            setSelectedPet('');
            setReason('');
            handleSearch(); // Refresh the list
        } catch (error) {
            console.error('Error booking appointment:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
            alert('Failed to book appointment: ' + errorMessage);
        }
    };

    const formatDateTime = (dateTime) => {
        return new Date(dateTime).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="vet-search-booking">
            <div className="search-header">
                <h1>🔍 Find a Veterinarian</h1>
                <p>Search for vets by specialty, location, and availability</p>
            </div>

            <div className="search-form">
                <div className="form-row">
                    <div className="form-field">
                        <label>Specialization</label>
                        <input
                            type="text"
                            placeholder="e.g., Dermatology, Surgery..."
                            value={searchParams.specialization}
                            onChange={(e) => setSearchParams({ ...searchParams, specialization: e.target.value })}
                        />
                    </div>
                    <div className="form-field">
                        <label>Location</label>
                        <input
                            type="text"
                            placeholder="City or address..."
                            value={searchParams.location}
                            onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-field">
                        <label>Date</label>
                        <input
                            type="date"
                            value={searchParams.date}
                            onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    <div className="form-field">
                        <label>Appointment Type</label>
                        <select
                            value={searchParams.appointmentType}
                            onChange={(e) => setSearchParams({ ...searchParams, appointmentType: e.target.value })}
                        >
                            <option value="">Any</option>
                            <option value="TELECONSULT">Teleconsultation</option>
                            <option value="IN_CLINIC">In-Clinic</option>
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-field checkbox-field">
                        <label>
                            <input
                                type="checkbox"
                                checked={searchParams.teleconsultAvailable === true}
                                onChange={(e) => setSearchParams({
                                    ...searchParams,
                                    teleconsultAvailable: e.target.checked ? true : null
                                })}
                            />
                            <span>Teleconsult Available Only</span>
                        </label>
                    </div>
                </div>

                <button className="btn-search" onClick={handleSearch}>
                    🔍 Search Vets
                </button>
            </div>

            {loading ? (
                <div className="loading">Searching for vets...</div>
            ) : (
                <div className="results-section">
                    {vetsWithSlots.length === 0 ? (
                        <div className="no-results">
                            <p>No vets found with available slots matching your criteria.</p>
                            <p>Try adjusting your search filters.</p>
                        </div>
                    ) : (
                        <div className="vets-list">
                            {vetsWithSlots.map((vet) => (
                                <div key={vet.id} className="vet-card">
                                    <div className="vet-info">
                                        <div className="vet-header">
                                            <h3>{vet.name}</h3>
                                            <span className="specialization">{vet.specialization}</span>
                                        </div>
                                        <div className="vet-details">
                                            <p><strong>Clinic:</strong> {vet.clinicName}</p>
                                            <p><strong>Location:</strong> {vet.clinicAddress}</p>
                                            <p><strong>Experience:</strong> {vet.yearsOfExperience} years</p>
                                            <p><strong>Fee:</strong> ${vet.consultationFee}</p>
                                            {vet.bio && <p className="bio">{vet.bio}</p>}
                                        </div>
                                    </div>

                                    <div className="available-slots">
                                        <h4>Available Slots ({vet.availableSlots.length})</h4>
                                        <div className="slots-grid">
                                            {vet.availableSlots.slice(0, 6).map((slot) => (
                                                <div key={slot.id} className="slot-item">
                                                    <div className="slot-time">
                                                        {formatDateTime(slot.startTime)}
                                                    </div>
                                                    <div className="slot-info">
                                                        <span className="slot-type">
                                                            {slot.mode === 'TELECONSULT' ? '📹' :
                                                                slot.mode === 'IN_CLINIC' ? '🏥' : '📹/🏥'}
                                                        </span>
                                                        <span className="slot-capacity">
                                                            {slot.availableSpots} spot{slot.availableSpots !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                    <button
                                                        className="btn-book-slot"
                                                        onClick={() => handleBookSlot(slot, vet)}
                                                    >
                                                        Book
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        {vet.availableSlots.length > 6 && (
                                            <p className="more-slots">+{vet.availableSlots.length - 6} more slots available</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {showBookingModal && selectedSlot && (
                <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Book Appointment</h3>
                        <div className="booking-details">
                            <p><strong>Vet:</strong> {selectedSlot.vet.name}</p>
                            <p><strong>Clinic:</strong> {selectedSlot.vet.clinicName}</p>
                            <p><strong>Date & Time:</strong> {formatDateTime(selectedSlot.startTime)}</p>
                            <p><strong>Type:</strong> {selectedSlot.mode.replace('_', ' ')}</p>
                        </div>

                        <div className="form-group">
                            <label>Select Pet *</label>
                            <select
                                value={selectedPet}
                                onChange={(e) => setSelectedPet(e.target.value)}
                                required
                            >
                                <option value="">Choose a pet...</option>
                                {pets.map((pet) => (
                                    <option key={pet.id} value={pet.id}>
                                        {pet.name} ({pet.species})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Reason for Visit</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Describe the reason for this appointment..."
                                rows="3"
                            />
                        </div>

                        <div className="modal-actions">
                            <button className="btn-confirm" onClick={confirmBooking}>
                                Confirm Booking
                            </button>
                            <button className="btn-cancel" onClick={() => setShowBookingModal(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VetSearchWithBooking;
