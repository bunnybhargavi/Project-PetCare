import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointmentService';
import './OwnerAppointmentsView.css';

const OwnerAppointmentsView = ({ ownerId }) => {
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('UPCOMING');

    useEffect(() => {
        if (ownerId) {
            fetchAppointments();
        }
    }, [ownerId]);

    useEffect(() => {
        filterAppointments();
    }, [statusFilter, appointments]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const data = await appointmentService.getOwnerAppointments(ownerId);
            setAppointments(data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            alert('Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    };

    const filterAppointments = () => {
        const now = new Date();

        switch (statusFilter) {
            case 'UPCOMING':
                setFilteredAppointments(
                    appointments.filter(apt =>
                        (apt.status === 'PENDING' || apt.status === 'CONFIRMED') &&
                        new Date(apt.appointmentDate) >= now
                    )
                );
                break;
            case 'PAST':
                setFilteredAppointments(
                    appointments.filter(apt =>
                        apt.status === 'COMPLETED' ||
                        (new Date(apt.appointmentDate) < now && apt.status !== 'CANCELLED')
                    )
                );
                break;
            case 'CANCELLED':
                setFilteredAppointments(
                    appointments.filter(apt => apt.status === 'CANCELLED')
                );
                break;
            default:
                setFilteredAppointments(appointments);
        }
    };

    const handleCancelAppointment = async (appointmentId) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

        try {
            await appointmentService.cancelAppointmentOwner(appointmentId);
            alert('Appointment cancelled successfully!');
            fetchAppointments();
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            alert('Failed to cancel appointment');
        }
    };

    const formatDateTime = (dateTime) => {
        return new Date(dateTime).toLocaleString('en-US', {
            weekday: 'long',
            month: 'long',
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
            <span className="type-badge video">📹 Teleconsultation</span> :
            <span className="type-badge clinic">🏥 In-Clinic Visit</span>;
    };

    return (
        <div className="owner-appointments-view">
            <div className="appointments-header">
                <h1>📅 My Appointments</h1>
                <div className="filter-tabs">
                    {['UPCOMING', 'PAST', 'CANCELLED', 'ALL'].map(filter => (
                        <button
                            key={filter}
                            className={`filter-tab ${statusFilter === filter ? 'active' : ''}`}
                            onClick={() => setStatusFilter(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading your appointments...</div>
            ) : (
                <div className="appointments-container">
                    {filteredAppointments.length === 0 ? (
                        <div className="no-appointments">
                            <div className="empty-icon">📭</div>
                            <h3>No appointments found</h3>
                            <p>You don't have any {statusFilter.toLowerCase()} appointments.</p>
                        </div>
                    ) : (
                        <div className="appointments-grid">
                            {filteredAppointments.map((appointment) => (
                                <div key={appointment.id} className="appointment-card">
                                    <div className="card-header">
                                        <div className="appointment-number">Appointment #{appointment.id}</div>
                                        {getStatusBadge(appointment.status)}
                                    </div>

                                    <div className="card-body">
                                        <div className="vet-info-section">
                                            <h3>{appointment.veterinarian?.clinicName || 'Clinic'}</h3>
                                            <p className="vet-name">Dr. {appointment.veterinarian?.user?.name || 'Veterinarian'}</p>
                                            <p className="specialization">{appointment.veterinarian?.specialization}</p>
                                        </div>

                                        <div className="appointment-details">
                                            <div className="detail-item">
                                                <span className="icon">🐾</span>
                                                <div>
                                                    <div className="label">Pet</div>
                                                    <div className="value">{appointment.pet?.name}</div>
                                                </div>
                                            </div>

                                            <div className="detail-item">
                                                <span className="icon">📅</span>
                                                <div>
                                                    <div className="label">Date & Time</div>
                                                    <div className="value">{formatDateTime(appointment.appointmentDate)}</div>
                                                </div>
                                            </div>

                                            <div className="detail-item">
                                                <span className="icon">📍</span>
                                                <div>
                                                    <div className="label">Type</div>
                                                    <div className="value">{getTypeBadge(appointment.type)}</div>
                                                </div>
                                            </div>

                                            {appointment.reason && (
                                                <div className="detail-item full-width">
                                                    <span className="icon">📝</span>
                                                    <div>
                                                        <div className="label">Reason</div>
                                                        <div className="value">{appointment.reason}</div>
                                                    </div>
                                                </div>
                                            )}

                                            {appointment.type === 'TELECONSULT' && appointment.meetingLink &&
                                                (appointment.status === 'CONFIRMED' || appointment.status === 'PENDING') && (
                                                    <div className="detail-item full-width">
                                                        <span className="icon">🎥</span>
                                                        <div>
                                                            <div className="label">Video Link</div>
                                                            <a
                                                                href={appointment.meetingLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="meeting-link"
                                                            >
                                                                Join Video Call →
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}

                                            {appointment.notes && (
                                                <div className="detail-item full-width">
                                                    <span className="icon">💬</span>
                                                    <div>
                                                        <div className="label">Vet Notes</div>
                                                        <div className="value notes">{appointment.notes}</div>
                                                    </div>
                                                </div>
                                            )}

                                            {appointment.prescription && (
                                                <div className="detail-item full-width">
                                                    <span className="icon">💊</span>
                                                    <div>
                                                        <div className="label">Prescription</div>
                                                        <div className="value prescription">{appointment.prescription}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {(appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') && (
                                        <div className="card-footer">
                                            <button
                                                className="btn-cancel-appointment"
                                                onClick={() => handleCancelAppointment(appointment.id)}
                                            >
                                                Cancel Appointment
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OwnerAppointmentsView;
