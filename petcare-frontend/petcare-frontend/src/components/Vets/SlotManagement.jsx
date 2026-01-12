import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointmentService';
import './SlotManagement.css';

const SlotManagement = ({ vetId }) => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    const [newSlot, setNewSlot] = useState({
        startTime: '',
        endTime: '',
        mode: 'BOTH',
        capacity: 1
    });

    useEffect(() => {
        if (vetId) {
            fetchSlots();
        }
    }, [vetId, dateRange]);

    const fetchSlots = async () => {
        try {
            setLoading(true);
            const data = await appointmentService.getSlotsByDateRange(
                vetId,
                dateRange.startDate,
                dateRange.endDate
            );
            setSlots(data);
        } catch (error) {
            console.error('Error fetching slots:', error);
            alert('Failed to fetch slots');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSlot = async (e) => {
        e.preventDefault();
        try {
            await appointmentService.createSlot({
                vetId,
                startTime: newSlot.startTime,
                endTime: newSlot.endTime,
                mode: newSlot.mode,
                capacity: newSlot.capacity
            });
            alert('Slot created successfully!');
            setShowCreateForm(false);
            setNewSlot({
                startTime: '',
                endTime: '',
                mode: 'BOTH',
                capacity: 1
            });
            fetchSlots();
        } catch (error) {
            console.error('Error creating slot:', error);
            alert('Failed to create slot');
        }
    };

    const handleDeleteSlot = async (slotId) => {
        if (!window.confirm('Are you sure you want to delete this slot?')) return;

        try {
            await appointmentService.deleteSlot(slotId);
            alert('Slot deleted successfully!');
            fetchSlots();
        } catch (error) {
            console.error('Error deleting slot:', error);
            alert(error.response?.data?.message || 'Failed to delete slot. It may have existing bookings.');
        }
    };

    const formatDateTime = (dateTime) => {
        return new Date(dateTime).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (slot) => {
        const availableSpots = slot.capacity - slot.bookedCount;
        if (availableSpots === 0) return <span className="badge badge-full">Fully Booked</span>;
        if (availableSpots < slot.capacity / 2) return <span className="badge badge-limited">Limited ({availableSpots} left)</span>;
        return <span className="badge badge-available">Available ({availableSpots}/{slot.capacity})</span>;
    };

    return (
        <div className="slot-management">
            <div className="slot-header">
                <h2>📅 Slot Management</h2>
                <button
                    className="btn-create-slot"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    {showCreateForm ? '✕ Cancel' : '+ Create New Slot'}
                </button>
            </div>

            {showCreateForm && (
                <div className="create-slot-form">
                    <h3>Create New Slot</h3>
                    <form onSubmit={handleCreateSlot}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Start Time</label>
                                <input
                                    type="datetime-local"
                                    value={newSlot.startTime}
                                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>End Time</label>
                                <input
                                    type="datetime-local"
                                    value={newSlot.endTime}
                                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Appointment Type</label>
                                <select
                                    value={newSlot.mode}
                                    onChange={(e) => setNewSlot({ ...newSlot, mode: e.target.value })}
                                >
                                    <option value="BOTH">Both (Video & In-Clinic)</option>
                                    <option value="TELECONSULT">Teleconsult Only</option>
                                    <option value="IN_CLINIC">In-Clinic Only</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Capacity</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={newSlot.capacity}
                                    onChange={(e) => setNewSlot({ ...newSlot, capacity: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn-submit">Create Slot</button>
                    </form>
                </div>
            )}

            <div className="date-range-filter">
                <label>View Slots From:</label>
                <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
                <label>To:</label>
                <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
            </div>

            {loading ? (
                <div className="loading">Loading slots...</div>
            ) : (
                <div className="slots-list">
                    {slots.length === 0 ? (
                        <div className="no-slots">
                            <p>No slots found for the selected date range.</p>
                            <p>Create your first slot to start accepting appointments!</p>
                        </div>
                    ) : (
                        <div className="slots-grid">
                            {slots.map((slot) => (
                                <div key={slot.id} className="slot-card">
                                    <div className="slot-time">
                                        <div className="time-label">Start</div>
                                        <div className="time-value">{formatDateTime(slot.startTime)}</div>
                                    </div>
                                    <div className="slot-time">
                                        <div className="time-label">End</div>
                                        <div className="time-value">{formatDateTime(slot.endTime)}</div>
                                    </div>
                                    <div className="slot-details">
                                        <div className="detail-item">
                                            <span className="detail-label">Type:</span>
                                            <span className="detail-value">{slot.mode ? slot.mode.replace('_', ' ') : 'BOTH'}</span>
                                        </div>
                                        <div className="detail-item">
                                            {getStatusBadge(slot)}
                                        </div>
                                    </div>
                                    <div className="slot-actions">
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDeleteSlot(slot.id)}
                                            disabled={slot.bookedCount > 0}
                                            title={slot.bookedCount > 0 ? 'Cannot delete slot with bookings' : 'Delete slot'}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SlotManagement;
