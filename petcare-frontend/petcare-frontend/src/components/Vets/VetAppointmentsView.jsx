import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointmentService';
import './VetAppointmentsView.css';

const VetAppointmentsView = ({ vetId }) => {
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [notes, setNotes] = useState('');
    const [prescription, setPrescription] = useState('');

    useEffect(() => {
        if (vetId) {
            fetchAppointments();
        }
    }, [vetId]);

    useEffect(() => {
        filterAppointments();
    }, [statusFilter, appointments]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const data = await appointmentService.getVetAppointments(vetId);
            setAppointments(data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            alert('Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    };

    const filterAppointments = () => {
        if (statusFilter === 'ALL') {
            setFilteredAppointments(appointments);
        } else {
            setFilteredAppointments(appointments.filter(apt => apt.status === statusFilter));
        }
    };

    const handleStatusUpdate = async (appointmentId, newStatus) => {
        try {
            await appointmentService.updateAppointmentStatus(appointmentId, {
                status: newStatus,
                notes: notes || undefined,
                prescription: prescription || undefined
            });
            alert(`Appointment ${newStatus.toLowerCase()} successfully!`);
            setSelectedAppointment(null);
            setNotes('');
            setPrescription('');
            fetchAppointments();
        } catch (error) {
            console.error('Error updating appointment:', error);
            alert('Failed to update appointment');
        }
    };

    const formatDateTime = (dateTime) => {
        return new Date(dateTime).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            PENDING: <span className="status-badge pending">⏳ Pending</span>,
            CONFIRMED: <span className="status-badge confirmed">✓ Confirmed</span>,
            COMPLETED: <span className="status-badge completed">✓ Completed</span>,
            CANCELLED: <span className="status-badge cancelled">✕ Cancelled</span>,
            NO_SHOW: <span className="status-badge no-show">⚠ No Show</span>
        };
        return badges[status] || status;
    };

    const getTypeBadge = (type) => {
        return type === 'TELECONSULT' ?
            <span className="type-badge video">📹 Teleconsult</span> :
            <span className="type-badge clinic">🏥 In-Clinic</span>;
    };

    return (
        <div className="vet-appointments-view">
            <div className="appointments-header">
                <h2>📋 My Appointments</h2>
                <div className="filter-buttons">
                    {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(status => (
                        <button
                            key={status}
                            className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
                            onClick={() => setStatusFilter(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading appointments...</div>
            ) : (
                <div className="appointments-list">
                    {filteredAppointments.length === 0 ? (
                        <div className="no-appointments">
                            <p>No appointments found for the selected filter.</p>
                        </div>
                    ) : (
                        <div className="appointments-grid">
                            {filteredAppointments.map((appointment) => (
                                <div key={appointment.id} className="appointment-card">
                                    <div className="appointment-header-card">
                                        <div className="appointment-id">#{appointment.id}</div>
                                        {getStatusBadge(appointment.status)}
                                    </div>

                                    <div className="appointment-details">
                                        <div className="detail-row">
                                            <span className="label">Pet:</span>
                                            <span className="value">{appointment.pet?.name || 'N/A'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Owner:</span>
                                            <span className="value">{appointment.pet?.owner?.user?.name || 'N/A'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Date & Time:</span>
                                            <span className="value">{formatDateTime(appointment.appointmentDate)}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="label">Type:</span>
                                            {getTypeBadge(appointment.type)}
                                        </div>
                                        {appointment.reason && (
                                            <div className="detail-row">
                                                <span className="label">Reason:</span>
                                                <span className="value">{appointment.reason}</span>
                                            </div>
                                        )}
                                        {appointment.type === 'TELECONSULT' && appointment.meetingLink && (
                                            <div className="detail-row">
                                                <span className="label">Meeting Link:</span>
                                                <a href={appointment.meetingLink} target="_blank" rel="noopener noreferrer" className="meeting-link">
                                                    Join Video Call
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {appointment.status === 'CONFIRMED' && (
                                        <div className="appointment-actions">
                                            <button
                                                className="btn-action btn-complete"
                                                onClick={() => setSelectedAppointment(appointment)}
                                            >
                                                ✓ Complete
                                            </button>
                                            <button
                                                className="btn-action btn-cancel"
                                                onClick={() => handleStatusUpdate(appointment.id, 'CANCELLED')}
                                            >
                                                ✕ Cancel
                                            </button>
                                        </div>
                                    )}

                                    {appointment.status === 'PENDING' && (
                                        <div className="appointment-actions">
                                            <button
                                                className="btn-action btn-confirm"
                                                onClick={() => handleStatusUpdate(appointment.id, 'CONFIRMED')}
                                            >
                                                ✓ Confirm
                                            </button>
                                            <button
                                                className="btn-action btn-cancel"
                                                onClick={() => handleStatusUpdate(appointment.id, 'CANCELLED')}
                                            >
                                                ✕ Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {selectedAppointment && (
                <div className="modal-overlay" onClick={() => setSelectedAppointment(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Complete Appointment</h3>
                        <p>Appointment with {selectedAppointment.pet?.name}</p>

                        <div className="form-group">
                            <label>Notes</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add consultation notes..."
                                rows="4"
                            />
                        </div>

                        <div className="form-group">
                            <label>Prescription</label>
                            <textarea
                                value={prescription}
                                onChange={(e) => setPrescription(e.target.value)}
                                placeholder="Add prescription details..."
                                rows="4"
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn-modal btn-submit"
                                onClick={() => handleStatusUpdate(selectedAppointment.id, 'COMPLETED')}
                            >
                                Complete Appointment
                            </button>
                            <button
                                className="btn-modal btn-cancel-modal"
                                onClick={() => setSelectedAppointment(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VetAppointmentsView;
