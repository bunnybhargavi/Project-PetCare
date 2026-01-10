import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import Navbar from '../Layout/Navbar';
import './PatientsPage.css';

const PatientsPage = () => {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const vetId = user?.veterinarianId || user?.vetId || user?.userId || user?.id;
        if (vetId) {
            fetchPatients(vetId);
        } else {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchPatients = async (vetId) => {
        try {
            setLoading(true);
            // Get all appointments for this vet
            const appointments = await appointmentService.getVetAppointments(vetId);

            // Helper to calculate age from DOB
            const calculateAge = (dob) => {
                if (!dob) return null;
                const birthDate = new Date(dob);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                return age > 0 ? age : 0;
            };

            // Extract unique pets from appointments
            const uniquePets = {};
            appointments.forEach(apt => {
                if (apt.pet && apt.pet.id) {
                    if (!uniquePets[apt.pet.id]) {
                        uniquePets[apt.pet.id] = {
                            ...apt.pet,
                            age: calculateAge(apt.pet.dateOfBirth),
                            owner: apt.pet.owner,
                            lastVisit: apt.appointmentDate,
                            totalVisits: 1,
                            appointments: [apt]
                        };
                    } else {
                        uniquePets[apt.pet.id].totalVisits++;
                        uniquePets[apt.pet.id].appointments.push(apt);
                        // Update last visit if this appointment is more recent
                        if (new Date(apt.appointmentDate) > new Date(uniquePets[apt.pet.id].lastVisit)) {
                            uniquePets[apt.pet.id].lastVisit = apt.appointmentDate;
                        }
                    }
                }
            });

            setPatients(Object.values(uniquePets));
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(patient =>
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.species?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.owner?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getSpeciesIcon = (species) => {
        const icons = {
            'Dog': '🐕',
            'Cat': '🐈',
            'Bird': '🦜',
            'Rabbit': '🐰',
            'Hamster': '🐹',
            'Fish': '🐠'
        };
        return icons[species] || '🐾';
    };

    return (
        <div className="patients-page">
            <Navbar />
            <div className="patients-container">
                <div className="patients-header">
                    <h1>🏥 My Patients</h1>
                    <p>View and manage all pets you've treated</p>
                </div>

                <div className="search-section">
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by pet name, species, breed, or owner..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="stats-summary">
                        <div className="stat-item">
                            <span className="stat-value">{patients.length}</span>
                            <span className="stat-label">Total Patients</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{filteredPatients.length}</span>
                            <span className="stat-label">Showing</span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading patients...</p>
                    </div>
                ) : filteredPatients.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">🐾</span>
                        <h3>No patients found</h3>
                        <p>{searchTerm ? 'Try adjusting your search' : 'Start seeing patients to build your patient list'}</p>
                    </div>
                ) : (
                    <div className="patients-grid">
                        {filteredPatients.map((patient) => (
                            <div
                                key={patient.id}
                                className="patient-card"
                                onClick={() => setSelectedPatient(patient)}
                            >
                                <div className="patient-card-header">
                                    <div className="patient-icon">
                                        {patient.photo ? (
                                            <img
                                                src={`http://localhost:8080${patient.photo}`}
                                                alt={patient.name}
                                                className="patient-photo"
                                            />
                                        ) : (
                                            getSpeciesIcon(patient.species)
                                        )}
                                    </div>
                                    <div className="patient-basic-info">
                                        <h3>{patient.name}</h3>
                                        <p className="patient-species">{patient.species} • {patient.breed}</p>
                                    </div>
                                </div>

                                <div className="patient-details">
                                    <div className="detail-row">
                                        <span className="label">Owner:</span>
                                        <span className="value">{patient.owner?.user?.name || 'N/A'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Age:</span>
                                        <span className="value">{patient.age || 'N/A'} years</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Gender:</span>
                                        <span className="value">{patient.gender || 'N/A'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Weight:</span>
                                        <span className="value">
                                            {patient.weight ? `${patient.weight} kg` : 'Not recorded'}
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Last Visit:</span>
                                        <span className="value">{formatDate(patient.lastVisit)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Total Visits:</span>
                                        <span className="value badge">{patient.totalVisits}</span>
                                    </div>
                                </div>

                                <button className="view-details-btn">
                                    View Full Details →
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {selectedPatient && (
                    <div className="modal-overlay" onClick={() => setSelectedPatient(null)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="modal-close" onClick={() => setSelectedPatient(null)}>×</button>

                            <div className="modal-header">
                                <div className="modal-icon">
                                    {selectedPatient.photo ? (
                                        <img
                                            src={`http://localhost:8080${selectedPatient.photo}`}
                                            alt={selectedPatient.name}
                                            className="modal-pet-photo"
                                        />
                                    ) : (
                                        getSpeciesIcon(selectedPatient.species)
                                    )}
                                </div>
                                <div>
                                    <h2>{selectedPatient.name}</h2>
                                    <p>{selectedPatient.species} • {selectedPatient.breed}</p>
                                </div>
                            </div>

                            <div className="modal-tabs">
                                <div className="tab active">Information</div>
                                <div className="tab">Medical History</div>
                                <div className="tab">Prescriptions</div>
                            </div>

                            <div className="modal-body">
                                <div className="info-section">
                                    <h3>Basic Information</h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <span className="info-label">Age</span>
                                            <span className="info-value">{selectedPatient.age ? `${selectedPatient.age} years` : 'Unknown'}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Gender</span>
                                            <span className="info-value">{selectedPatient.gender || 'Unknown'}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Weight</span>
                                            <span className="info-value">
                                                {selectedPatient.weight ? `${selectedPatient.weight} kg` : 'Not recorded'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="info-section">
                                    <h3>Owner Information</h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <span className="info-label">Name</span>
                                            <span className="info-value">{selectedPatient.owner?.user?.name || 'Unknown'}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Email</span>
                                            <span className="info-value email-value">
                                                {selectedPatient.owner?.user?.email || 'Not provided'}
                                            </span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Phone</span>
                                            <span className="info-value">{selectedPatient.owner?.user?.phone || 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="info-section">
                                    <h3>Visit History ({selectedPatient.totalVisits} visits)</h3>
                                    <div className="appointments-list">
                                        {selectedPatient.appointments?.map((apt, index) => (
                                            <div key={index} className="appointment-item">
                                                <div className="apt-date">{formatDate(apt.appointmentDate)}</div>
                                                <div className="apt-type">{apt.type === 'TELECONSULT' ? '📹 Teleconsult' : '🏥 In-Clinic'}</div>
                                                <div className="apt-status">{apt.status}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientsPage;
