import React, { useState, useEffect } from 'react';
import {
  FaStethoscope, FaCalendarAlt, FaUserMd, FaClipboardList,
  FaPrescriptionBottle, FaSearch, FaTimes,
  FaPaw, FaEdit, FaEye,
  FaClock, FaCheckCircle, FaExclamationTriangle, FaPlus,
  FaChartBar, FaFileAlt
} from 'react-icons/fa';
import { appointmentService } from '../../services/appointmentService';
import { vetMedicalRecordsService } from '../../services/vetMedicalRecordsService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './VetDashboard.css';

// Mock data - replace with actual API calls


// Carousel Images - Using more reliable sources
const vetCarouselImages = [
  'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=1200&q=80&auto=format&fit=crop', // Vet with dog
  'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=1200&q=80&auto=format&fit=crop', // Vet clinic
  'https://images.unsplash.com/photo-1559190394-df5a28aab5c5?w=1200&q=80&auto=format&fit=crop', // Vet examining pet
  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1200&q=80&auto=format&fit=crop', // Modern vet office
];

const VetDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientDetail, setShowPatientDetail] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  // Carousel timer
  useEffect(() => {
    console.log('Carousel initialized with', vetCarouselImages.length, 'images');
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => {
        const newIndex = (prev + 1) % vetCarouselImages.length;
        console.log('Carousel changing from image', prev, 'to image', newIndex);
        return newIndex;
      });
    }, 3000); // Faster for testing - 3 seconds
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingRecords: 0,
    urgentCases: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      const vetId = user?.vetId || user?.userId || user?.id;
      if (!vetId) return;
      try {
        // Fetch all appointments and pending appointments
        const [allAppointments, pendingData] = await Promise.all([
          appointmentService.getVetAppointments(vetId),
          appointmentService.getPendingAppointments(vetId)
        ]);

        // Map All Appointment Data
        const mappedAppointments = allAppointments.map(apt => ({
          id: apt.id,
          petName: apt.pet?.name || 'Unknown Pet',
          ownerName: apt.pet?.owner?.user?.name || 'Unknown Owner',
          time: new Date(apt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(apt.appointmentDate).toLocaleDateString(),
          type: apt.type,
          status: apt.status?.toLowerCase() || 'pending',
          rawDate: apt.appointmentDate,
          photo: apt.pet?.photo || apt.pet?.photoUrl, // Use same field name as OwnerDashboard
          species: apt.pet?.species,
          petId: apt.pet?.id,
          reason: apt.reason
        }));
        setAppointments(mappedAppointments);

        // Map Pending Appointments
        const mappedPendingAppointments = pendingData.map(apt => ({
          id: apt.id,
          petName: apt.pet?.name || 'Unknown Pet',
          ownerName: apt.pet?.owner?.user?.name || 'Unknown Owner',
          time: new Date(apt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(apt.appointmentDate).toLocaleDateString(),
          type: apt.type,
          status: apt.status?.toLowerCase() || 'pending',
          rawDate: apt.appointmentDate,
          photo: apt.pet?.photo || apt.pet?.photoUrl,
          species: apt.pet?.species,
          petId: apt.pet?.id,
          reason: apt.reason
        }));
        setPendingAppointments(mappedPendingAppointments);

        // Helper to calculate age from DOB
        const calculateAge = (dob) => {
          if (!dob) return 0;
          const birthDate = new Date(dob);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          return age > 0 ? age : 0;
        };

        // Derive Unique Patients
        const uniquePatientsMap = new Map();
        allAppointments.forEach(apt => {
          if (apt.pet && !uniquePatientsMap.has(apt.pet.id)) {
            uniquePatientsMap.set(apt.pet.id, {
              id: apt.pet.id,
              name: apt.pet.name,
              species: apt.pet.species || 'Unknown',
              breed: apt.pet.breed || 'Unknown',
              age: apt.pet.age || calculateAge(apt.pet.dateOfBirth),
              owner: apt.pet.owner?.user?.name || 'Unknown',
              lastVisit: new Date(apt.appointmentDate).toLocaleDateString(),
              photo: apt.pet.photo || apt.pet.photoUrl // Use same field name as OwnerDashboard
            });
          }
        });
        const derivedPatients = Array.from(uniquePatientsMap.values());
        setPatients(derivedPatients);

        // Update Stats
        const today = new Date().toLocaleDateString();
        setStats({
          todayAppointments: mappedAppointments.filter(a => a.date === today).length,
          totalPatients: derivedPatients.length,
          pendingRecords: mappedPendingAppointments.length, // Show pending count
          urgentCases: 0
        });

      } catch (error) {
        console.error("Error fetching vet dashboard data:", error);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const menuItems = [
    { id: 'overview', icon: FaStethoscope, label: 'Overview', emoji: '🏥' },
    { id: 'pending', icon: FaExclamationTriangle, label: 'Pending Approvals', emoji: '⏳' },
    { id: 'appointments', icon: FaCalendarAlt, label: 'Appointments', emoji: '📅' },
    { id: 'availability', icon: FaClock, label: 'Availability', emoji: '⏰' },
    { id: 'patients', icon: FaPaw, label: 'Patients', emoji: '🐾' },
    { id: 'records', icon: FaClipboardList, label: 'Records', emoji: '📋' },
    { id: 'prescriptions', icon: FaPrescriptionBottle, label: 'Prescriptions', emoji: '💊' },
    { id: 'analytics', icon: FaChartBar, label: 'Analytics', emoji: '📊' },
    { id: 'profile', icon: FaUserMd, label: 'Profile', emoji: '👨‍⚕️' },
  ];

  const statsData = [
    { emoji: '📅', label: 'Today\'s Appointments', value: stats.todayAppointments, color: '#C3E5FF', icon: FaCalendarAlt },
    { emoji: '🐾', label: 'Total Patients', value: stats.totalPatients, color: '#FFB3D9', icon: FaPaw },
    { emoji: '⏳', label: 'Pending Approvals', value: stats.pendingRecords, color: '#FFF9C4', icon: FaExclamationTriangle },
    { emoji: '⚠️', label: 'Urgent Cases', value: stats.urgentCases, color: '#FFCDD2', icon: FaExclamationTriangle },
  ];



  const handleViewPatient = (appt) => {
    if (!appt || !appt.petId) return;
    const patient = patients.find(p => p.id === appt.petId);
    if (patient) {
      setSelectedPatient(patient);
      setShowPatientDetail(true);
    }
  };

  // Refresh data after approval/rejection
  const refreshData = async () => {
    const vetId = user?.vetId || user?.userId || user?.id;
    if (!vetId) return;

    try {
      const [allAppointments, pendingData] = await Promise.all([
        appointmentService.getVetAppointments(vetId),
        appointmentService.getPendingAppointments(vetId)
      ]);

      // Update appointments
      const mappedAppointments = allAppointments.map(apt => ({
        id: apt.id,
        petName: apt.pet?.name || 'Unknown Pet',
        ownerName: apt.pet?.owner?.user?.name || 'Unknown Owner',
        time: new Date(apt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date(apt.appointmentDate).toLocaleDateString(),
        type: apt.type,
        status: apt.status?.toLowerCase() || 'pending',
        rawDate: apt.appointmentDate,
        photo: apt.pet?.photo || apt.pet?.photoUrl,
        species: apt.pet?.species,
        petId: apt.pet?.id,
        reason: apt.reason
      }));
      setAppointments(mappedAppointments);

      // Update pending appointments
      const mappedPendingAppointments = pendingData.map(apt => ({
        id: apt.id,
        petName: apt.pet?.name || 'Unknown Pet',
        ownerName: apt.pet?.owner?.user?.name || 'Unknown Owner',
        time: new Date(apt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date(apt.appointmentDate).toLocaleDateString(),
        type: apt.type,
        status: apt.status?.toLowerCase() || 'pending',
        rawDate: apt.appointmentDate,
        photo: apt.pet?.photo || apt.pet?.photoUrl,
        species: apt.pet?.species,
        petId: apt.pet?.id,
        reason: apt.reason
      }));
      setPendingAppointments(mappedPendingAppointments);

      // Update stats
      const today = new Date().toLocaleDateString();
      setStats({
        todayAppointments: mappedAppointments.filter(a => a.date === today).length,
        totalPatients: patients.length,
        pendingRecords: mappedPendingAppointments.length,
        urgentCases: 0
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  // Handle appointment approval
  const handleApproveAppointment = async (appointmentId, vetNotes) => {
    try {
      await appointmentService.approveAppointment(appointmentId, vetNotes);
      alert('Appointment approved successfully!');
      refreshData(); // Refresh the data
    } catch (error) {
      console.error('Error approving appointment:', error);
      alert('Failed to approve appointment: ' + (error.response?.data?.message || error.message));
    }
  };

  // Handle appointment rejection
  const handleRejectAppointment = async (appointmentId, rejectionReason) => {
    try {
      await appointmentService.rejectAppointment(appointmentId, rejectionReason);
      alert('Appointment rejected successfully!');
      refreshData(); // Refresh the data
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      alert('Failed to reject appointment: ' + (error.response?.data?.message || error.message));
    }
  };

  // Handle opening edit modal
  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setShowEditModal(true);
  };

  // Handle saving appointment changes
  const handleSaveEdit = async (appointmentId, updates) => {
    try {
      // If status is changed
      if (updates.status && updates.status !== editingAppointment.status) {
        if (updates.status === 'CANCELLED') {
          await appointmentService.cancelAppointment(appointmentId, updates.notes);
        } else if (updates.status === 'COMPLETED') {
          await appointmentService.completeAppointment(appointmentId, updates.notes, '');
        } else {
          await appointmentService.updateAppointmentStatus(appointmentId, { status: updates.status, notes: updates.notes });
        }
      }

      // If rescheduling (mock logic for now as backend endpoint might vary)
      if (updates.reschedule) {
        // Implement reschedule logic here if available, or alert
        alert("Rescheduling request noted. Please contact admin for slot changes.");
      }

      alert('Appointment updated successfully!');
      setShowEditModal(false);
      setEditingAppointment(null);
      refreshData();
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment: ' + (error.response?.data?.message || error.message));
    }
  };

  // Handle marking appointment as completed
  const handleCompleteAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to mark this appointment as completed?')) {
      try {
        await appointmentService.completeAppointment(appointmentId, 'Completed via dashboard', '');
        alert('Appointment marked as completed!');
        refreshData();
      } catch (error) {
        console.error('Error completing appointment:', error);
        alert('Failed to complete appointment: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div className="vet-dashboard-container">
      {/* Hero Section - Simplified */}
      <div className="vet-hero-section">
        {/* Background Carousel */}
        {vetCarouselImages.map((img, index) => {
          const isActive = currentImageIndex === index;
          return (
            <div
              key={index}
              className="vet-hero-background"
              style={{
                backgroundImage: `url(${img})`,
                opacity: isActive ? 1 : 0,
                transition: 'opacity 1.5s ease-in-out',
                zIndex: 1
              }}
            />
          );
        })}
        {/* Dark Overlay */}
        <div className="vet-hero-overlay" />

        {/* Indicators */}
        <div className="vet-indicators">
          {vetCarouselImages.map((_, index) => (
            <div
              key={index}
              className={`vet-dot ${currentImageIndex === index ? 'vet-dot-active' : ''}`}
              onClick={() => {
                console.log('Clicked indicator:', index);
                setCurrentImageIndex(index);
              }}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </div>

        <div className="vet-hero-content" style={{ marginTop: '0', paddingTop: '40px' }}>
          <h1 className="vet-hero-title">
            Welcome, {user?.name}! 🩺
          </h1>
          <p className="vet-hero-subtitle">
            Manage your appointments and patients efficiently.
          </p>


          <div className="vet-hero-buttons">
            <button onClick={() => setActiveSection('appointments')} className="vet-primary-btn">
              <FaCalendarAlt /> View Appointments
            </button>
            <button onClick={() => setActiveSection('patients')} className="vet-secondary-btn">
              <FaPaw /> Patient Records
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="vet-main-content">
        {/* Stats Grid */}
        <div className="vet-stats-grid">
          {statsData.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="vet-stat-card" style={{ borderBottom: `4px solid ${stat.color}` }}>
                <div className="vet-stat-info">
                  <p className="vet-stat-label">{stat.label}</p>
                  <p className="vet-stat-value">{stat.value}</p>
                </div>
                <div className="vet-stat-icon-container">
                  <Icon className="vet-stat-icon" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <nav className="vet-nav-container">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`vet-nav-item ${activeSection === item.id ? 'vet-nav-item-active' : ''}`}
              >
                <Icon />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Content Sections */}
        <div className="vet-content-section">
          {activeSection === 'overview' && (
            <OverviewSection
              appointments={appointments}
              patients={patients}
              pendingAppointments={pendingAppointments}
              setActiveSection={setActiveSection}
              onViewPatient={handleViewPatient}
              onComplete={handleCompleteAppointment}
              onEdit={handleEditAppointment}
            />
          )}
          {activeSection === 'pending' && (
            <PendingApprovalsSection
              pendingAppointments={pendingAppointments}
              onApprove={handleApproveAppointment}
              onReject={handleRejectAppointment}
              onRefresh={refreshData}
            />
          )}
          {activeSection === 'appointments' && (
            <AppointmentsSection
              appointments={appointments}
              onViewPatient={handleViewPatient}
              onComplete={handleCompleteAppointment}
              onEdit={handleEditAppointment}
            />
          )}
          {activeSection === 'availability' && <AvailabilitySection user={user} />}
          {activeSection === 'patients' && (
            <PatientsSection
              patients={patients}
              setSelectedPatient={setSelectedPatient}
              setShowPatientDetail={setShowPatientDetail}
            />
          )}
          {activeSection === 'records' && <MedicalRecordsSection user={user} />}
          {activeSection === 'prescriptions' && <PrescriptionsSection user={user} appointments={appointments} />}
          {activeSection === 'analytics' && <AnalyticsSection user={user} appointments={appointments} patients={patients} />}
          {activeSection === 'profile' && <ProfileSection user={user} />}
        </div>
      </div>

      {/* Modals */}
      {showPatientDetail && selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          onClose={() => {
            setShowPatientDetail(false);
            setSelectedPatient(null);
          }}
        />
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && editingAppointment && (
        <EditAppointmentModal
          appointment={editingAppointment}
          onClose={() => {
            setShowEditModal(false);
            setEditingAppointment(null);
          }}
          onSave={handleSaveEdit}
        />
      )}
    </div>

  );
};

// Overview Section
const OverviewSection = ({ appointments, patients, pendingAppointments, setActiveSection, onViewPatient, onComplete, onEdit }) => {
  const today = new Date().toLocaleDateString();
  const todayAppointments = appointments.filter(apt => apt.date === today);
  const recentPatients = patients.slice(0, 3);

  const quickActions = [
    { icon: FaCalendarAlt, title: 'Schedule Appointment', emoji: '📅', action: 'appointments' },
    { icon: FaPaw, title: 'Add Patient', emoji: '🐾', action: 'patients' },
    { icon: FaPrescriptionBottle, title: 'Write Prescription', emoji: '💊', action: 'prescriptions' },
    { icon: FaClipboardList, title: 'Update Records', emoji: '📋', action: 'records' },
  ];

  return (
    <div className="vet-overview-section">
      <div className="vet-section-title-center">
        <h2>Dashboard Overview 🏥</h2>
      </div>

      {/* Pending Approvals Alert */}
      {pendingAppointments && pendingAppointments.length > 0 && (
        <div className="vet-alert-banner" style={{
          background: 'linear-gradient(135deg, #FFF9C4 0%, #FFE082 100%)',
          border: '2px solid #FFC107',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ fontSize: '2rem' }}>⏳</div>
          <div>
            <h4 style={{ margin: 0, color: '#F57F17' }}>
              {pendingAppointments.length} Appointment{pendingAppointments.length > 1 ? 's' : ''} Awaiting Approval
            </h4>
            <p style={{ margin: '0.5rem 0 0 0', color: '#F57F17' }}>
              Pet owners are waiting for your response
            </p>
          </div>
          <button
            onClick={() => setActiveSection('pending')}
            className="vet-primary-btn"
            style={{ marginLeft: 'auto' }}
          >
            Review Now
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <h3 className="vet-section-subtitle">Quick Actions ⚡</h3>
      <div className="vet-card-grid">
        {quickActions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <div key={idx} className="vet-action-card" onClick={() => setActiveSection(action.action)}>
              <div className="vet-card-content">
                <div className="vet-action-header">
                  <span className="vet-action-emoji">{action.emoji}</span>
                  <Icon className="vet-action-icon" />
                </div>
                <h3 className="vet-card-title">{action.title}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's Appointments */}
      <h3 className="vet-section-subtitle">Today's Schedule 📅</h3>
      <div className="vet-appointments-preview">
        {todayAppointments.length > 0 ? (
          todayAppointments.map((apt) => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              compact
              onView={() => onViewPatient(apt)}
              onComplete={() => onComplete(apt.id)}
              onEdit={() => onEdit(apt)}
            />
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No appointments scheduled for today</p>
        )}
      </div>

      {/* Recent Patients */}
      <h3 className="vet-section-subtitle">Recent Patients 🐾</h3>
      <div className="vet-card-grid">
        {recentPatients.map((patient) => (
          <PatientCard key={patient.id} patient={patient} />
        ))}
      </div>
    </div>
  );
};

// Appointments Section
const AppointmentsSection = ({ appointments, onViewPatient, onComplete, onEdit }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || apt.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="vet-appointments-section">
      <div className="vet-section-header">
        <h2>Appointments 📅</h2>
        <button className="vet-primary-btn" onClick={() => alert('New Appointment feature coming soon! 📅\n\nFor now, patients can book appointments through the main booking system.')}>
          <FaPlus /> New Appointment
        </button>
      </div>

      <div className="vet-filters-row">
        <div className="vet-search-container">
          <FaSearch className="vet-search-icon" />
          <input
            type="text"
            placeholder="Search appointments... 🔍"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="vet-search-input"
          />
        </div>
      </div>

      <div className="vet-tabs-container mb-6" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
        {[
          { id: 'all', label: 'All 🌟' },
          { id: 'scheduled', label: 'Scheduled ⏰' },
          { id: 'in-progress', label: 'In Progress 🔄' },
          { id: 'completed', label: 'Completed ✅' },
          { id: 'cancelled', label: 'Cancelled ❌' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-4 py-2 rounded-lg transition-colors ${filterStatus === tab.id
              ? 'bg-purple-100 text-purple-700 font-bold border-b-2 border-purple-500'
              : 'text-gray-500 hover:bg-gray-50'
              }`}
            style={{
              backgroundColor: filterStatus === tab.id ? '#F3E5F5' : 'transparent',
              color: filterStatus === tab.id ? '#9C27B0' : '#666',
              border: 'none',
              borderBottom: filterStatus === tab.id ? '2px solid #9C27B0' : 'none',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
              fontWeight: filterStatus === tab.id ? 'bold' : 'normal'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>


      <div className="vet-appointments-list">
        {filteredAppointments.map((apt) => (
          <AppointmentCard
            key={apt.id}
            appointment={apt}
            onView={() => onViewPatient(apt)}
            onEdit={() => onEdit(apt)}
            onComplete={() => onComplete(apt.id)}
          />
        ))}
      </div>
    </div >
  );
};

// Appointment Card
const AppointmentCard = ({ appointment, compact = false, onView, onEdit, onComplete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#4CAF50'; // Green
      case 'in-progress': return '#FF9800'; // Orange
      case 'completed': return '#2196F3'; // Blue
      case 'cancelled': return '#F44336'; // Red
      default: return '#9E9E9E'; // Grey
    }
  };

  return (
    <div className={`vet-appointment-card ${compact ? 'compact' : ''}`}>
      {/* Pet Image Display with Status Border */}
      <div className="vet-appointment-image-container" style={{
        width: compact ? '40px' : '60px',
        height: compact ? '40px' : '60px',
        borderRadius: '50%', // Circle looks friendlier for pastel theme
        overflow: 'hidden',
        marginRight: '1rem',
        flexShrink: 0,
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        border: `3px solid ${getStatusColor(appointment.status)}` // Status indicator
      }}>
        {appointment.photo ? (
          <img
            src={`http://localhost:8080${appointment.photo}`}
            alt={appointment.petName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ fontSize: compact ? '1rem' : '1.5rem' }}>
            {appointment.species === 'Dog' ? '🐶' : appointment.species === 'Cat' ? '🐱' : '🐾'}
          </span>
        )}
      </div>

      <div className="vet-appointment-content">
        <div className="vet-appointment-header">
          <h3>{appointment.petName}</h3>
          <span className="vet-appointment-type" style={{ fontSize: '0.8rem', color: '#888' }}>{appointment.type}</span>
        </div>
        <p className="vet-appointment-owner" style={{ fontSize: '0.9rem' }}>Owner: {appointment.ownerName}</p>
        <div className="vet-appointment-time" style={{ fontSize: '0.85rem' }}>
          <FaClock /> {appointment.time} - {appointment.date}
        </div>
      </div>

      {!compact && (
        <div className="vet-appointment-actions">
          <button className="vet-icon-btn" onClick={onView} title="View Details">
            <FaEye />
          </button>
          <button className="vet-icon-btn" onClick={onEdit} title="Edit Appointment">
            <FaEdit />
          </button>
          {['scheduled', 'in-progress', 'approved'].includes(appointment.status) && (
            <button
              className="vet-icon-btn"
              onClick={onComplete}
              title="Mark as Completed"
              style={{ color: '#4CAF50', borderColor: '#4CAF50' }}
            >
              <FaCheckCircle />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Patients Section
const PatientsSection = ({ patients, setSelectedPatient, setShowPatientDetail }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('all');

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSpecies === 'all' || patient.species === filterSpecies;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="vet-patients-section">
      <div className="vet-section-header">
        <h2>Patient Records 🐾</h2>
        <button className="vet-primary-btn" onClick={() => alert('Add Patient feature coming soon! 🐾\n\nFor now, patients are automatically added when they book appointments with you.')}>
          <FaPlus /> Add Patient
        </button>
      </div>

      <div className="vet-filters-row">
        <div className="vet-search-container">
          <FaSearch className="vet-search-icon" />
          <input
            type="text"
            placeholder="Search patients... 🔍"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="vet-search-input"
          />
        </div>
        <select
          value={filterSpecies}
          onChange={(e) => setFilterSpecies(e.target.value)}
          className="vet-select-input"
        >
          <option value="all">All Species 🌟</option>
          <option value="Dog">Dogs 🐶</option>
          <option value="Cat">Cats 🐱</option>
          <option value="Bird">Birds 🦜</option>
        </select>
      </div>

      <div className="vet-card-grid">
        {filteredPatients.map((patient) => (
          <PatientCard
            key={patient.id}
            patient={patient}
            onClick={() => {
              setSelectedPatient(patient);
              setShowPatientDetail(true);
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Patient Card
const PatientCard = ({ patient, onClick }) => {
  return (
    <div className="vet-patient-card" onClick={onClick}>
      <div className="vet-patient-image">
        {patient.photo ? (
          <img
            src={`http://localhost:8080${patient.photo}`}
            alt={patient.name}
          />
        ) : (
          <div className="vet-patient-image-placeholder">
            {patient.species === 'Dog' ? '🐶' : patient.species === 'Cat' ? '🐱' : '🐾'}
          </div>
        )}
      </div>
      <div className="vet-card-content">
        <h3 className="vet-card-title">{patient.name}</h3>
        <p className="vet-card-text">{patient.breed} • {patient.age} years</p>
        <p className="vet-patient-owner">Owner: {patient.owner}</p>
        <p className="vet-patient-lastvisit">Last Visit: {patient.lastVisit}</p>
      </div>
    </div>
  );
};

// Coming Soon Section
const ComingSoonSection = ({ icon, title }) => (
  <div className="vet-coming-soon">
    <div className="vet-coming-soon-emoji">{icon}</div>
    <h2>{title}</h2>
    <p>Feature coming soon! 🚀</p>
  </div>
);

// Profile Section
const ProfileSection = ({ user }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  if (!user) return null;

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleViewSchedule = () => {
    setShowScheduleModal(true);
  };

  return (
    <div className="vet-profile-section">
      <div className="vet-profile-card">
        <div className="vet-profile-avatar">
          <FaUserMd />
        </div>
        <h2>{user.name}</h2>
        <p className="vet-profile-email" style={{ color: '#666', marginBottom: '0.5rem' }}>{user.email}</p>
        <p className="vet-profile-specialty">{user.specialty}</p>
        <p className="vet-profile-license">License: {user.license}</p>
        <div className="vet-profile-actions">
          <button className="vet-primary-btn" onClick={handleEditProfile}>Edit Profile</button>
          <button className="vet-secondary-btn" onClick={handleViewSchedule}>View Schedule</button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedData) => {
            console.log('Profile updated:', updatedData);
            alert('Profile updated successfully!');
            setShowEditModal(false);
          }}
        />
      )}

      {/* View Schedule Modal */}
      {showScheduleModal && (
        <ViewScheduleModal
          user={user}
          onClose={() => setShowScheduleModal(false)}
        />
      )}
    </div>
  );
};

// Patient Detail Modal
const PatientDetailModal = ({ patient, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'medical' && patient?.id) {
      const fetchRecords = async () => {
        setLoading(true);
        try {
          // Use a default ID if user.vetId is missing for dev/testing, but prefer user.vetId
          const vetId = user?.vetId || user?.userId || user?.id || 1;
          const data = await vetMedicalRecordsService.getCompleteMedicalHistory(patient.id, vetId);
          setMedicalRecords(data.medicalRecords || []);
        } catch (error) {
          console.error("Failed to fetch medical records", error);
        } finally {
          setLoading(false);
        }
      };
      fetchRecords();
    }
  }, [activeTab, patient, user]);

  return (
    <div className="vet-modal-overlay" onClick={onClose}>
      <div className="vet-modal-content vet-modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="vet-modal-header">
          <h2>{patient.name} 💕</h2>
          <button onClick={onClose} className="vet-close-btn"><FaTimes /></button>
        </div>

        <div className="vet-modal-tabs">
          <button
            className={`vet-tab ${activeTab === 'info' ? 'vet-tab-active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Information
          </button>
          <button
            className={`vet-tab ${activeTab === 'medical' ? 'vet-tab-active' : ''}`}
            onClick={() => setActiveTab('medical')}
          >
            Medical History
          </button>
          <button
            className={`vet-tab ${activeTab === 'prescriptions' ? 'vet-tab-active' : ''}`}
            onClick={() => setActiveTab('prescriptions')}
          >
            Prescriptions
          </button>
        </div>

        <div className="vet-modal-body">
          {activeTab === 'info' && (
            <div>
              <div className="vet-patient-detail-image">
                {patient.photo ? (
                  <img
                    src={`http://localhost:8080${patient.photo}`}
                    alt={patient.name}
                  />
                ) : (
                  <div className="vet-patient-image-placeholder-large" style={{
                    fontSize: '5rem',
                    background: '#f0f2f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    width: '100%',
                    borderRadius: '12px'
                  }}>
                    {patient.species === 'Dog' ? '🐶' : patient.species === 'Cat' ? '🐱' : '🐾'}
                  </div>
                )}
              </div>
              <div className="vet-patient-detail-info">
                <div className="vet-info-row">
                  <span className="vet-info-label">Species:</span>
                  <span>{patient.species}</span>
                </div>
                <div className="vet-info-row">
                  <span className="vet-info-label">Breed:</span>
                  <span>{patient.breed}</span>
                </div>
                <div className="vet-info-row">
                  <span className="vet-info-label">Age:</span>
                  <span>{patient.age} years</span>
                </div>
                <div className="vet-info-row">
                  <span className="vet-info-label">Owner:</span>
                  <span>{patient.owner}</span>
                </div>
                <div className="vet-info-row">
                  <span className="vet-info-label">Last Visit:</span>
                  <span>{patient.lastVisit}</span>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'medical' && (
            <div className="vet-tab-content">
              {loading ? (
                <div className="text-center py-4">Loading records...</div>
              ) : medicalRecords.length > 0 ? (
                <MedicalRecordsList records={medicalRecords} />
              ) : (
                <div className="vet-empty-state">
                  <p>No medical records found for this patient.</p>
                </div>
              )}
            </div>
          )}
          {activeTab === 'prescriptions' && (
            <div className="vet-tab-content">
              <p>Prescription records will be displayed here...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AvailabilitySection = ({ user }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [type, setType] = useState('BOTH');
  const [capacity, setCapacity] = useState(1); // Add capacity state
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState([]);

  const vetId = user?.vetId || user?.userId || user?.id || 1;

  useEffect(() => {
    if (vetId) fetchSlots();
  }, [vetId]);

  const fetchSlots = async () => {
    try {
      const data = await appointmentService.getAvailableSlots(vetId);
      // Sort by start time
      const sorted = (data || []).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      setSlots(sorted);
    } catch (e) {
      console.error("Failed to fetch slots", e);
    }
  };

  const handleCreate = async () => {
    if (!startTime || !endTime) return alert("Select times");
    if (capacity < 1) return alert("Capacity must be at least 1");
    setLoading(true);
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      await appointmentService.createSlot({
        vetId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        mode: type, // Fix: use 'mode' instead of 'supportedType'
        capacity: capacity // Add capacity to the request
      });
      alert('Slot created successfully!');
      setStartTime('');
      setEndTime('');
      setCapacity(1); // Reset capacity
      fetchSlots(); // Refresh list
    } catch (e) { alert('Error: ' + (e.response?.data?.message || e.message)); }
    setLoading(false);
  };

  const handleDelete = async (slotId) => {
    if (!window.confirm("Delete this slot?")) return;
    try {
      await appointmentService.deleteSlot(slotId);
      setSlots(slots.filter(s => s.id !== slotId));
    } catch (e) {
      alert("Failed to delete slot");
    }
  };

  return (
    <div className="vet-content-section">
      <div className="vet-section-header">
        <h2>Manage Availability ⏰</h2>
      </div>

      <div className="vet-availability-container" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Create Slot Card */}
        <div className="vet-action-card p-4" style={{ cursor: 'default' }}>
          <h3 className="mb-4 font-bold text-lg">Add New Slot ➕</h3>
          <div className="flex gap-4 items-end flex-wrap">
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label className="block text-sm mb-1 font-semibold text-gray-600">Start Time</label>
              <input type="datetime-local" className="border p-2 rounded w-full border-gray-300" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label className="block text-sm mb-1 font-semibold text-gray-600">End Time</label>
              <input type="datetime-local" className="border p-2 rounded w-full border-gray-300" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
            <div style={{ width: '150px' }}>
              <label className="block text-sm mb-1 font-semibold text-gray-600">Type</label>
              <select className="border p-2 rounded w-full border-gray-300" value={type} onChange={e => setType(e.target.value)}>
                <option value="BOTH">Video & Clinic</option>
                <option value="TELECONSULT">Video Only</option>
                <option value="IN_CLINIC">Clinic Only</option>
              </select>
            </div>
            <div style={{ width: '120px' }}>
              <label className="block text-sm mb-1 font-semibold text-gray-600">Capacity</label>
              <input
                type="number"
                min="1"
                max="20"
                className="border p-2 rounded w-full border-gray-300"
                value={capacity}
                onChange={e => setCapacity(parseInt(e.target.value) || 1)}
                placeholder="1"
              />
            </div>
            <button onClick={handleCreate} disabled={loading} className="vet-primary-btn" style={{ height: '42px', marginTop: 'auto', minWidth: '120px' }}>
              {loading ? 'Adding...' : 'Add Slot'}
            </button>
          </div>
        </div>

        {/* Existing Slots List */}
        <div>
          <h3 className="mb-4 font-bold text-lg">Your Slots ({slots.length}) 📅</h3>
          {slots.length === 0 ? (
            <p className="text-gray-500 italic">No available slots. Add one above!</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {slots.map(slot => (
                <div key={slot.id} className="vet-stat-card" style={{ borderLeft: `4px solid ${slot.status === 'AVAILABLE' ? '#4CAF50' : '#FF9800'}`, padding: '1rem' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-800">
                        {new Date(slot.startTime).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                        {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className={`inline-block px-2 py-1 rounded text-xs ${slot.mode === 'TELECONSULT' ? 'bg-blue-100 text-blue-700' : slot.mode === 'IN_CLINIC' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                          {slot.mode === 'BOTH' ? 'Video & Clinic' : slot.mode === 'TELECONSULT' ? 'Video Only' : 'Clinic Only'}
                        </span>
                        <span className={`inline-block px-2 py-1 rounded text-xs ${(slot.bookedCount || 0) >= (slot.capacity || 1) ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {slot.bookedCount || 0}/{slot.capacity || 1} booked
                        </span>
                      </div>
                      {slot.capacity > 1 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Capacity: {slot.capacity} appointments
                        </p>
                      )}
                    </div>
                    <button onClick={() => handleDelete(slot.id)} className="text-red-500 hover:text-red-700 font-bold px-2 py-1">
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Pending Approvals Section
const PendingApprovalsSection = ({ pendingAppointments, onApprove, onReject, onRefresh }) => {
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalType, setApprovalType] = useState('approve'); // 'approve' or 'reject'
  const [notes, setNotes] = useState('');

  const handleApprovalAction = (appointment, type) => {
    setSelectedAppointment(appointment);
    setApprovalType(type);
    setNotes('');
    setShowApprovalModal(true);
  };

  const handleSubmitApproval = async () => {
    if (!selectedAppointment) return;

    try {
      if (approvalType === 'approve') {
        await onApprove(selectedAppointment.id, notes);
      } else {
        if (!notes.trim()) {
          alert('Please provide a reason for rejection');
          return;
        }
        await onReject(selectedAppointment.id, notes);
      }
      setShowApprovalModal(false);
      setSelectedAppointment(null);
      setNotes('');
    } catch (error) {
      console.error('Error processing approval:', error);
    }
  };

  return (
    <div className="vet-pending-section">
      <div className="vet-section-header">
        <h2>Pending Approvals ⏳</h2>
        <button onClick={onRefresh} className="vet-secondary-btn">
          🔄 Refresh
        </button>
      </div>

      {pendingAppointments.length === 0 ? (
        <div className="vet-empty-state">
          <div className="text-6xl mb-4">✅</div>
          <h3>All Caught Up!</h3>
          <p>No pending appointments requiring approval.</p>
        </div>
      ) : (
        <div className="vet-pending-list">
          {pendingAppointments.map((appointment) => (
            <PendingAppointmentCard
              key={appointment.id}
              appointment={appointment}
              onApprove={() => handleApprovalAction(appointment, 'approve')}
              onReject={() => handleApprovalAction(appointment, 'reject')}
            />
          ))}
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedAppointment && (
        <div className="vet-modal-overlay" onClick={() => setShowApprovalModal(false)}>
          <div className="vet-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="vet-modal-header">
              <h3>
                {approvalType === 'approve' ? '✅ Approve' : '❌ Reject'} Appointment
              </h3>
              <button onClick={() => setShowApprovalModal(false)} className="vet-close-btn">
                <FaTimes />
              </button>
            </div>

            <div className="vet-modal-body">
              <div className="mb-4">
                <h4>{selectedAppointment.petName}</h4>
                <p>Owner: {selectedAppointment.ownerName}</p>
                <p>Date: {selectedAppointment.date} at {selectedAppointment.time}</p>
                <p>Type: {selectedAppointment.type}</p>
                {selectedAppointment.reason && <p>Reason: {selectedAppointment.reason}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">
                  {approvalType === 'approve' ? 'Notes (Optional):' : 'Rejection Reason:'}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    approvalType === 'approve'
                      ? 'Add any notes for this appointment...'
                      : 'Please provide a reason for rejection...'
                  }
                  className="w-full p-3 border rounded-lg"
                  rows="3"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="vet-secondary-btn"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitApproval}
                  className={approvalType === 'approve' ? 'vet-primary-btn' : 'vet-danger-btn'}
                >
                  {approvalType === 'approve' ? '✅ Approve' : '❌ Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Pending Appointment Card
const PendingAppointmentCard = ({ appointment, onApprove, onReject }) => {
  return (
    <div className="vet-pending-card">
      {/* Pet Image */}
      <div className="vet-pending-image">
        {appointment.photo ? (
          <img
            src={`http://localhost:8080${appointment.photo}`}
            alt={appointment.petName}
          />
        ) : (
          <div className="vet-pending-image-placeholder">
            {appointment.species === 'Dog' ? '🐶' : appointment.species === 'Cat' ? '🐱' : '🐾'}
          </div>
        )}
      </div>

      {/* Appointment Details */}
      <div className="vet-pending-content">
        <h3>{appointment.petName}</h3>
        <p className="text-gray-600">Owner: {appointment.ownerName}</p>
        <p className="text-sm text-gray-500">
          📅 {appointment.date} at {appointment.time}
        </p>
        <p className="text-sm text-gray-500">
          📋 {appointment.type}
        </p>
        {appointment.reason && (
          <p className="text-sm text-blue-600 mt-2">
            💬 {appointment.reason}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="vet-pending-actions">
        <button
          onClick={onApprove}
          className="vet-approve-btn"
          title="Approve Appointment"
        >
          ✅ Approve
        </button>
        <button
          onClick={onReject}
          className="vet-reject-btn"
          title="Reject Appointment"
        >
          ❌ Reject
        </button>
      </div>
    </div>
  );
};

// Patient Record Card Component
const PatientRecordCard = ({ patient, onClick }) => {
  return (
    <div 
      className="vet-patient-record-card" 
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: '1px solid #f0f0f0',
        ':hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
        }
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        {/* Pet Image */}
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          overflow: 'hidden',
          flexShrink: 0,
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '3px solid #E1BEE7'
        }}>
          {patient.photo ? (
            <img
              src={`http://localhost:8080${patient.photo}`}
              alt={patient.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontSize: '1.5rem' }}>
              {patient.species === 'Dog' ? '🐶' : patient.species === 'Cat' ? '🐱' : '🐾'}
            </span>
          )}
        </div>

        {/* Patient Details */}
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '1.2rem', fontWeight: 'bold' }}>
            {patient.name}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', fontSize: '0.9rem', color: '#666' }}>
            <p style={{ margin: 0 }}>
              <strong>Species:</strong> {patient.species}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Age:</strong> {patient.age} years
            </p>
            <p style={{ margin: 0 }}>
              <strong>Breed:</strong> {patient.breed}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Visits:</strong> {patient.appointmentCount}
            </p>
          </div>

          <div style={{ 
            marginTop: '0.75rem', 
            padding: '0.5rem', 
            backgroundColor: '#F3E5F5', 
            borderRadius: '6px',
            fontSize: '0.85rem'
          }}>
            <p style={{ margin: 0, color: '#7B1FA2' }}>
              <strong>Owner:</strong> {patient.owner}
            </p>
            <p style={{ margin: '0.25rem 0 0 0', color: '#7B1FA2' }}>
              <strong>Last Visit:</strong> {patient.lastVisit}
            </p>
          </div>

          <div style={{ 
            marginTop: '0.75rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}>
            <span style={{ 
              fontSize: '0.8rem', 
              color: '#9C27B0', 
              fontWeight: '600' 
            }}>
              Click to view medical records →
            </span>
            <div style={{ fontSize: '1.2rem' }}>📋</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Medical Records Section
const MedicalRecordsSection = ({ user }) => {
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [medicalData, setMedicalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [availablePatients, setAvailablePatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);

  const vetId = user?.vetId || user?.userId || user?.id;

  // Fetch available patients when component mounts
  useEffect(() => {
    const fetchAvailablePatients = async () => {
      setPatientsLoading(true);
      try {
        // Get all appointments for this vet to derive patients
        const appointments = await appointmentService.getVetAppointments(vetId);
        
        // Extract unique patients from appointments
        const uniquePatientsMap = new Map();
        appointments.forEach(apt => {
          if (apt.pet && !uniquePatientsMap.has(apt.pet.id)) {
            const calculateAge = (dob) => {
              if (!dob) return 0;
              const birthDate = new Date(dob);
              const today = new Date();
              let age = today.getFullYear() - birthDate.getFullYear();
              const m = today.getMonth() - birthDate.getMonth();
              if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
              }
              return age > 0 ? age : 0;
            };

            uniquePatientsMap.set(apt.pet.id, {
              id: apt.pet.id,
              name: apt.pet.name,
              species: apt.pet.species || 'Unknown',
              breed: apt.pet.breed || 'Unknown',
              age: apt.pet.age || calculateAge(apt.pet.dateOfBirth),
              owner: apt.pet.owner?.user?.name || 'Unknown',
              lastVisit: new Date(apt.appointmentDate).toLocaleDateString(),
              photo: apt.pet.photo || apt.pet.photoUrl,
              appointmentCount: appointments.filter(a => a.pet?.id === apt.pet.id).length
            });
          }
        });
        
        const patients = Array.from(uniquePatientsMap.values());
        setAvailablePatients(patients);
      } catch (error) {
        console.error('Error fetching available patients:', error);
      } finally {
        setPatientsLoading(false);
      }
    };

    if (vetId) {
      fetchAvailablePatients();
    }
  }, [vetId]);

  const handleViewMedicalRecords = async (petId) => {
    setLoading(true);
    try {
      const data = await vetMedicalRecordsService.getCompleteMedicalHistory(petId, vetId);
      setMedicalData(data);
      setSelectedPetId(petId);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      alert('Error loading medical records: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Filter patients based on search term
  const filteredPatients = availablePatients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="vet-medical-records-section">
      <div className="vet-section-header">
        <h2>Medical Records 📋</h2>
        {selectedPetId && (
          <button 
            onClick={() => {
              setSelectedPetId(null);
              setMedicalData(null);
            }}
            className="vet-secondary-btn"
          >
            ← Back to Patient List
          </button>
        )}
      </div>

      {selectedPetId && medicalData ? (
        <MedicalRecordsViewer
          medicalData={medicalData}
          onClose={() => {
            setSelectedPetId(null);
            setMedicalData(null);
          }}
          vetId={vetId}
        />
      ) : (
        <div>
          <div className="vet-search-container mb-4">
            <FaSearch className="vet-search-icon" />
            <input
              type="text"
              placeholder="Search patients by name, owner, species, or breed... 🔍"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="vet-search-input"
            />
          </div>

          {patientsLoading ? (
            <div className="vet-loading-spinner">Loading patients...</div>
          ) : availablePatients.length === 0 ? (
            <div className="vet-records-placeholder">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🐾</div>
                <h3>No Patients Found</h3>
                <p>You don't have any patients with appointment history yet.</p>
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#F3E5F5', borderRadius: '8px', maxWidth: '400px', margin: '1.5rem auto 0' }}>
                  <p style={{ fontSize: '0.9rem', color: '#7B1FA2', margin: 0 }}>
                    💡 <strong>Tip:</strong> Patients will appear here after you have appointments with them.
                  </p>
                </div>
              </div>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="vet-records-placeholder">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3>No Matching Patients</h3>
                <p>No patients match your search criteria. Try adjusting your search terms.</p>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
                Found {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''} • Click on a patient to view their medical records
              </div>
              
              <div className="vet-patients-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1rem'
              }}>
                {filteredPatients.map((patient) => (
                  <PatientRecordCard
                    key={patient.id}
                    patient={patient}
                    onClick={() => handleViewMedicalRecords(patient.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="vet-loading-overlay">
          <div className="vet-loading-spinner">Loading medical records...</div>
        </div>
      )}
    </div>
  );
};

// Medical Records Viewer Component
const MedicalRecordsViewer = ({ medicalData, onClose, vetId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showConsultationModal, setShowConsultationModal] = useState(false);

  const { pet, medicalRecords, vaccinations, healthMeasurements, activeReminders, appointmentHistory } = medicalData;

  return (
    <div className="vet-medical-viewer">
      <div className="vet-medical-header">
        <div className="flex items-center gap-4">
          <div className="vet-pet-avatar">
            {pet.photo ? (
              <img src={`http://localhost:8080${pet.photo}`} alt={pet.name} />
            ) : (
              <div className="vet-pet-placeholder">
                {pet.species === 'Dog' ? '🐶' : pet.species === 'Cat' ? '🐱' : '🐾'}
              </div>
            )}
          </div>
          <div>
            <h2>{pet.name}</h2>
            <p>{pet.breed} • {pet.age} years • {pet.gender}</p>
            <p className="text-sm text-gray-600">Owner: {pet.owner?.user?.name}</p>
          </div>
        </div>
        <button onClick={onClose} className="vet-close-btn">
          <FaTimes />
        </button>
      </div>

      <div className="vet-medical-tabs">
        <button
          className={`vet-tab ${activeTab === 'overview' ? 'vet-tab-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`vet-tab ${activeTab === 'records' ? 'vet-tab-active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          📋 Medical Records ({medicalRecords.length})
        </button>
        <button
          className={`vet-tab ${activeTab === 'vaccinations' ? 'vet-tab-active' : ''}`}
          onClick={() => setActiveTab('vaccinations')}
        >
          💉 Vaccinations ({vaccinations.length})
        </button>
        <button
          className={`vet-tab ${activeTab === 'measurements' ? 'vet-tab-active' : ''}`}
          onClick={() => setActiveTab('measurements')}
        >
          📏 Health Data ({healthMeasurements.length})
        </button>
        <button
          className={`vet-tab ${activeTab === 'appointments' ? 'vet-tab-active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          📅 History ({appointmentHistory.length})
        </button>
      </div>

      <div className="vet-medical-content">
        {activeTab === 'overview' && (
          <MedicalOverview
            pet={pet}
            medicalRecords={medicalRecords}
            vaccinations={vaccinations}
            healthMeasurements={healthMeasurements}
            activeReminders={activeReminders}
          />
        )}
        {activeTab === 'records' && (
          <MedicalRecordsList records={medicalRecords} />
        )}
        {activeTab === 'vaccinations' && (
          <VaccinationsList vaccinations={vaccinations} />
        )}
        {activeTab === 'measurements' && (
          <HealthMeasurementsList measurements={healthMeasurements} />
        )}
        {activeTab === 'appointments' && (
          <AppointmentHistoryList
            appointments={appointmentHistory}
            onAddConsultationNotes={(appointmentId) => {
              setShowConsultationModal(appointmentId);
            }}
          />
        )}
      </div>

      {showConsultationModal && (
        <ConsultationNotesModal
          appointmentId={showConsultationModal}
          vetId={vetId}
          onClose={() => setShowConsultationModal(false)}
          onSave={() => {
            setShowConsultationModal(false);
            // Refresh medical data
          }}
        />
      )}
    </div>
  );
};

// Medical Overview Component
const MedicalOverview = ({ pet, medicalRecords, vaccinations, healthMeasurements, activeReminders }) => {
  const recentRecords = medicalRecords.slice(0, 3);
  const recentVaccinations = vaccinations.slice(0, 3);
  const recentMeasurements = healthMeasurements.slice(0, 3);

  return (
    <div className="vet-medical-overview">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="vet-overview-card">
          <h4>📋 Medical Records</h4>
          <p className="text-2xl font-bold">{medicalRecords.length}</p>
        </div>
        <div className="vet-overview-card">
          <h4>💉 Vaccinations</h4>
          <p className="text-2xl font-bold">{vaccinations.length}</p>
        </div>
        <div className="vet-overview-card">
          <h4>📏 Health Data</h4>
          <p className="text-2xl font-bold">{healthMeasurements.length}</p>
        </div>
        <div className="vet-overview-card">
          <h4>🔔 Active Reminders</h4>
          <p className="text-2xl font-bold">{activeReminders.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="vet-overview-section">
          <h4>Recent Medical Records</h4>
          {recentRecords.map(record => (
            <div key={record.id} className="vet-record-item">
              <p className="font-semibold">{record.recordType}</p>
              <p className="text-sm text-gray-600">{record.visitDate}</p>
              <p className="text-sm">{record.diagnosis}</p>
            </div>
          ))}
        </div>

        <div className="vet-overview-section">
          <h4>Recent Vaccinations</h4>
          {recentVaccinations.map(vaccination => (
            <div key={vaccination.id} className="vet-record-item">
              <p className="font-semibold">{vaccination.vaccineName}</p>
              <p className="text-sm text-gray-600">{vaccination.dateGiven}</p>
              <p className="text-sm">Next due: {vaccination.nextDueDate}</p>
            </div>
          ))}
        </div>

        <div className="vet-overview-section">
          <h4>Active Reminders</h4>
          {activeReminders.map(reminder => (
            <div key={reminder.id} className="vet-record-item">
              <p className="font-semibold">{reminder.title}</p>
              <p className="text-sm text-gray-600">Due: {reminder.dueDate}</p>
              <p className="text-sm">{reminder.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Medical Records List Component
const MedicalRecordsList = ({ records }) => (
  <div className="vet-records-list">
    {records.map(record => (
      <div key={record.id} className="vet-record-card">
        <div className="vet-record-header">
          <h4>{record.recordType}</h4>
          <span className="vet-record-date">{record.visitDate}</span>
        </div>
        <div className="vet-record-content">
          <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
          <p><strong>Treatment:</strong> {record.treatment}</p>
          {record.notes && <p><strong>Notes:</strong> {record.notes}</p>}
          {record.veterinarianName && <p><strong>Vet:</strong> {record.veterinarianName}</p>}
          {(record.fileUrl || record.attachment) && (
            <div className="mt-2">
              <a
                href={`http://localhost:8080${record.fileUrl || record.attachment}`}
                target="_blank"
                rel="noopener noreferrer"
                className="vet-primary-btn text-sm inline-flex items-center gap-2"
                style={{ textDecoration: 'none', padding: '0.5rem 1rem' }}
              >
                <FaFileAlt /> View Document
              </a>
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
);

// Vaccinations List Component
const VaccinationsList = ({ vaccinations }) => (
  <div className="vet-vaccinations-list">
    {vaccinations.map(vaccination => (
      <div key={vaccination.id} className="vet-vaccination-card">
        <div className="vet-vaccination-header">
          <h4>{vaccination.vaccineName}</h4>
          <span className="vet-vaccination-date">{vaccination.dateGiven}</span>
        </div>
        <div className="vet-vaccination-content">
          <p><strong>Batch Number:</strong> {vaccination.batchNumber}</p>
          <p><strong>Next Due:</strong> {vaccination.nextDueDate}</p>
          {vaccination.notes && <p><strong>Notes:</strong> {vaccination.notes}</p>}
        </div>
      </div>
    ))}
  </div>
);

// Health Measurements List Component - Original Simple Version
const HealthMeasurementsList = ({ measurements }) => (
  <div className="vet-measurements-list">
    {measurements && measurements.length > 0 ? (
      measurements.map(measurement => (
        <div key={measurement.id} className="vet-measurement-card">
          <div className="vet-measurement-header">
            <h4>Health Measurement</h4>
            <span className="vet-measurement-date">
              {new Date(measurement.measurementDate).toLocaleDateString()}
            </span>
          </div>
          <div className="vet-measurement-content">
            {/* Display dynamic measurement type and value */}
            {measurement.measurementType && measurement.value && (
              <p><strong>{measurement.measurementType}:</strong> {measurement.value} {measurement.unit || ''}</p>
            )}
            
            {/* Display specific measurements */}
            {measurement.weight && (
              <p><strong>Weight:</strong> {measurement.weight} kg</p>
            )}
            {measurement.temperature && (
              <p><strong>Temperature:</strong> {measurement.temperature}°C</p>
            )}
            {measurement.heartRate && (
              <p><strong>Heart Rate:</strong> {measurement.heartRate} bpm</p>
            )}
            {measurement.bloodPressure && (
              <p><strong>Blood Pressure:</strong> {measurement.bloodPressure}</p>
            )}
            {measurement.bloodSugar && (
              <p><strong>Blood Sugar:</strong> {measurement.bloodSugar} mg/dL</p>
            )}
            {measurement.respiratoryRate && (
              <p><strong>Respiratory Rate:</strong> {measurement.respiratoryRate} breaths/min</p>
            )}
            
            {measurement.notes && <p><strong>Notes:</strong> {measurement.notes}</p>}
            
            {measurement.vetName && (
              <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>
                Recorded by: {measurement.vetName}
              </p>
            )}
          </div>
        </div>
      ))
    ) : (
      <div className="vet-empty-state">
        <div className="text-6xl mb-4">📏</div>
        <h3>No Health Measurements</h3>
        <p>No health measurements recorded for this patient yet.</p>
      </div>
    )}
  </div>
);

/* 
// Enhanced Health Measurements List Component - Available for Future Use
const HealthMeasurementsListEnhanced = ({ measurements, petId, vetId, onRefresh }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableMeasurementTypes, setAvailableMeasurementTypes] = useState([]);

  useEffect(() => {
    const fetchMeasurementTypes = async () => {
      try {
        const types = await vetMedicalRecordsService.getAvailableMeasurementTypes(vetId);
        setAvailableMeasurementTypes(types);
      } catch (error) {
        console.error('Error fetching measurement types:', error);
      }
    };

    if (vetId) {
      fetchMeasurementTypes();
    }
  }, [vetId]);

  // Group measurements by type for better display
  const groupedMeasurements = measurements?.reduce((groups, measurement) => {
    const type = measurement.measurementType || 'General';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(measurement);
    return groups;
  }, {}) || {};

  return (
    <div className="vet-measurements-list">
      <div className="vet-measurements-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1rem' 
      }}>
        <h3>Health Measurements ({measurements?.length || 0})</h3>
        <button 
          onClick={() => setShowAddModal(true)}
          className="vet-primary-btn"
          style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
        >
          <FaPlus /> Add Measurement
        </button>
      </div>

      {measurements && measurements.length > 0 ? (
        <div className="vet-measurements-groups">
          {Object.entries(groupedMeasurements).map(([type, typeMeasurements]) => (
            <div key={type} className="vet-measurement-group" style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ 
                color: '#7B1FA2', 
                borderBottom: '2px solid #E1BEE7', 
                paddingBottom: '0.5rem',
                marginBottom: '1rem'
              }}>
                {type} ({typeMeasurements.length})
              </h4>
              <div className="vet-measurement-cards" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '1rem' 
              }}>
                {typeMeasurements.map(measurement => (
                  <div key={measurement.id} className="vet-measurement-card" style={{
                    background: 'white',
                    padding: '1rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: '1px solid #E1BEE7'
                  }}>
                    <div className="vet-measurement-header" style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <h5 style={{ margin: 0, color: '#333' }}>
                        {measurement.measurementType || 'Health Measurement'}
                      </h5>
                      <span style={{ 
                        fontSize: '0.8rem', 
                        color: '#666',
                        background: '#F3E5F5',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px'
                      }}>
                        {new Date(measurement.measurementDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="vet-measurement-content">
                      {measurement.value && (
                        <p style={{ margin: '0.25rem 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#7B1FA2' }}>
                          <strong>Value:</strong> {measurement.value} {measurement.unit && `${measurement.unit}`}
                        </p>
                      )}
                      
                      {measurement.weight && (
                        <p style={{ margin: '0.25rem 0' }}>
                          <strong>Weight:</strong> {measurement.weight} kg
                        </p>
                      )}
                      {measurement.temperature && (
                        <p style={{ margin: '0.25rem 0' }}>
                          <strong>Temperature:</strong> {measurement.temperature}°C
                        </p>
                      )}
                      {measurement.heartRate && (
                        <p style={{ margin: '0.25rem 0' }}>
                          <strong>Heart Rate:</strong> {measurement.heartRate} bpm
                        </p>
                      )}
                      {measurement.bloodPressure && (
                        <p style={{ margin: '0.25rem 0' }}>
                          <strong>Blood Pressure:</strong> {measurement.bloodPressure} mmHg
                        </p>
                      )}
                      {measurement.bloodSugar && (
                        <p style={{ margin: '0.25rem 0' }}>
                          <strong>Blood Sugar:</strong> {measurement.bloodSugar} mg/dL
                        </p>
                      )}
                      {measurement.respiratoryRate && (
                        <p style={{ margin: '0.25rem 0' }}>
                          <strong>Respiratory Rate:</strong> {measurement.respiratoryRate} breaths/min
                        </p>
                      )}
                      
                      {measurement.notes && (
                        <p style={{ 
                          margin: '0.5rem 0 0 0', 
                          fontSize: '0.9rem', 
                          color: '#555',
                          fontStyle: 'italic',
                          borderTop: '1px solid #eee',
                          paddingTop: '0.5rem'
                        }}>
                          <strong>Notes:</strong> {measurement.notes}
                        </p>
                      )}
                      
                      {measurement.vetName && (
                        <p style={{ 
                          margin: '0.5rem 0 0 0', 
                          fontSize: '0.8rem', 
                          color: '#888' 
                        }}>
                          Recorded by: {measurement.vetName}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="vet-empty-state">
          <div className="text-6xl mb-4">📏</div>
          <h3>No Health Measurements</h3>
          <p>No health measurements recorded for this patient yet.</p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="vet-primary-btn"
            style={{ marginTop: '1rem' }}
          >
            <FaPlus /> Add First Measurement
          </button>
        </div>
      )}

      {showAddModal && (
        <AddHealthMeasurementModal
          petId={petId}
          vetId={vetId}
          availableMeasurementTypes={availableMeasurementTypes}
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false);
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
};
*/

// Add Health Measurement Modal Component
const AddHealthMeasurementModal = ({ petId, vetId, availableMeasurementTypes, onClose, onSave }) => {
  const [measurementType, setMeasurementType] = useState('');
  const [customType, setCustomType] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const finalMeasurementType = measurementType === 'custom' ? customType : measurementType;
    
    if (!finalMeasurementType || !value) {
      alert('Please provide measurement type and value');
      return;
    }

    setLoading(true);
    try {
      await vetMedicalRecordsService.addHealthMeasurement(
        petId, 
        vetId, 
        finalMeasurementType, 
        value, 
        unit, 
        notes
      );
      alert('Health measurement added successfully!');
      onSave();
    } catch (error) {
      console.error('Error adding health measurement:', error);
      alert('Error adding measurement: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getUnitSuggestions = (type) => {
    const unitMap = {
      'Weight': ['kg', 'lbs', 'g'],
      'Temperature': ['°C', '°F'],
      'Heart Rate': ['bpm'],
      'Blood Pressure': ['mmHg'],
      'Blood Sugar': ['mg/dL', 'mmol/L'],
      'Respiratory Rate': ['breaths/min'],
      'Pain Score': ['scale', '/10'],
      'Body Condition Score': ['scale', '/9'],
      'Dental Score': ['scale', '/4']
    };
    return unitMap[type] || [];
  };

  return (
    <div className="vet-modal-overlay" onClick={onClose}>
      <div className="vet-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="vet-modal-header">
          <h3>Add Health Measurement 📏</h3>
          <button onClick={onClose} className="vet-close-btn">
            <FaTimes />
          </button>
        </div>

        <div className="vet-modal-body">
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Measurement Type *</label>
            <select
              value={measurementType}
              onChange={(e) => setMeasurementType(e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
            >
              <option value="">Select measurement type...</option>
              {availableMeasurementTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
              <option value="custom">+ Add Custom Type</option>
            </select>
          </div>

          {measurementType === 'custom' && (
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Custom Measurement Type *</label>
              <input
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="Enter custom measurement type..."
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Value *</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter measurement value..."
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Unit</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {getUnitSuggestions(measurementType).map(suggestedUnit => (
                <button
                  key={suggestedUnit}
                  type="button"
                  onClick={() => setUnit(suggestedUnit)}
                  className="px-3 py-1 text-sm border rounded-full hover:bg-purple-50"
                  style={{ 
                    backgroundColor: unit === suggestedUnit ? '#F3E5F5' : 'white',
                    borderColor: unit === suggestedUnit ? '#9C27B0' : '#ddd',
                    color: unit === suggestedUnit ? '#9C27B0' : '#666'
                  }}
                >
                  {suggestedUnit}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Enter unit (e.g., kg, °C, bpm)..."
              className="w-full p-3 border rounded-lg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              className="w-full p-3 border rounded-lg"
              rows="3"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button onClick={onClose} className="vet-secondary-btn">
              Cancel
            </button>
            <button onClick={handleSave} disabled={loading} className="vet-primary-btn">
              {loading ? 'Adding...' : 'Add Measurement'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Appointment History List Component
const AppointmentHistoryList = ({ appointments, onAddConsultationNotes }) => (
  <div className="vet-appointments-history">
    {appointments.map(appointment => (
      <div key={appointment.id} className="vet-appointment-history-card">
        <div className="vet-appointment-history-header">
          <h4>{appointment.type} - {appointment.status}</h4>
          <span className="vet-appointment-date">{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
        </div>
        <div className="vet-appointment-history-content">
          <p><strong>Reason:</strong> {appointment.reason}</p>
          {appointment.notes && <p><strong>Notes:</strong> {appointment.notes}</p>}
          {appointment.prescription && <p><strong>Prescription:</strong> {appointment.prescription}</p>}
          {appointment.meetingLink && (
            <p><strong>Meeting Link:</strong>
              <a href={appointment.meetingLink} target="_blank" rel="noopener noreferrer" className="vet-meeting-link">
                Join Google Meet
              </a>
            </p>
          )}
        </div>
        {appointment.status === 'COMPLETED' && !appointment.notes && (
          <button
            onClick={() => onAddConsultationNotes(appointment.id)}
            className="vet-secondary-btn mt-2"
          >
            Add Consultation Notes
          </button>
        )}
      </div>
    ))}
  </div>
);

// Consultation Notes Modal Component
const ConsultationNotesModal = ({ appointmentId, vetId, onClose, onSave }) => {
  const [notes, setNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!notes.trim() || !diagnosis.trim()) {
      alert('Please provide both notes and diagnosis');
      return;
    }

    setLoading(true);
    try {
      await vetMedicalRecordsService.addConsultationNotes(appointmentId, vetId, notes, diagnosis, prescription);
      alert('Consultation notes saved successfully!');
      onSave();
    } catch (error) {
      console.error('Error saving consultation notes:', error);
      alert('Error saving notes: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vet-modal-overlay" onClick={onClose}>
      <div className="vet-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="vet-modal-header">
          <h3>Add Consultation Notes</h3>
          <button onClick={onClose} className="vet-close-btn">
            <FaTimes />
          </button>
        </div>

        <div className="vet-modal-body">
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Diagnosis *</label>
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Enter diagnosis..."
              className="w-full p-3 border rounded-lg"
              rows="3"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Consultation Notes *</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter detailed consultation notes..."
              className="w-full p-3 border rounded-lg"
              rows="4"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Prescription (Optional)</label>
            <textarea
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              placeholder="Enter prescription details..."
              className="w-full p-3 border rounded-lg"
              rows="3"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button onClick={onClose} className="vet-secondary-btn">
              Cancel
            </button>
            <button onClick={handleSave} disabled={loading} className="vet-primary-btn">
              {loading ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Appointment Modal
const EditAppointmentModal = ({ appointment, onClose, onSave }) => {
  const [status, setStatus] = useState(appointment.status || 'scheduled');
  const [notes, setNotes] = useState(appointment.notes || '');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  const handleSave = () => {
    onSave(appointment.id, {
      status,
      notes,
      reschedule: rescheduleDate || rescheduleTime ? { date: rescheduleDate, time: rescheduleTime } : null
    });
  };

  const handleCancelAppt = () => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      onSave(appointment.id, { status: 'CANCELLED', notes: notes || 'Cancelled by Vet' });
    }
  };

  return (
    <div className="vet-modal-overlay">
      <div className="vet-modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
        <div className="vet-modal-header">
          <h3>Edit Appointment ✏️</h3>
          <button onClick={onClose} className="vet-close-btn"><FaTimes /></button>
        </div>
        <div className="vet-modal-body">
          <div className="mb-4">
            <p><strong>Patient:</strong> {appointment.petName}</p>
            <p><strong>Current Status:</strong> <span className={`status-badge status-${appointment.status}`}>{appointment.status.toLowerCase()}</span></p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Update Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="CONFIRMED">Scheduled (Confirmed) ⏰</option>
              <option value="COMPLETED">Completed ✅</option>
              <option value="CANCELLED">Cancelled ❌</option>
              <option value="NO_SHOW">No Show 🚫</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border rounded"
              rows="3"
              placeholder="Add notes..."
            />
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded border">
            <label className="block text-sm font-bold mb-2 text-purple-700">Reschedule (Request Change)</label>
            <div className="flex gap-2">
              <input type="date" className="p-2 border rounded flex-1" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} />
              <input type="time" className="p-2 border rounded flex-1" value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)} />
            </div>
            <p className="text-xs text-gray-500 mt-1">Note: This will notify admin for slot changes.</p>
          </div>

          <div className="flex justify-between items-center mt-6">
            <button onClick={handleCancelAppt} className="text-red-600 hover:text-red-800 font-semibold px-4 py-2 border border-red-200 rounded hover:bg-red-50">
              Cancel Appointment
            </button>
            <div className="flex gap-3">
              <button onClick={onClose} className="vet-secondary-btn">Close</button>
              <button onClick={handleSave} className="vet-primary-btn">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/*
// Enhanced Components - Available for Future Use

// Prescriptions Section
const PrescriptionsSection = ({ user }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const vetId = user?.vetId || user?.userId || user?.id;

  useEffect(() => {
    const fetchPrescriptions = async () => {
      setLoading(true);
      try {
        const appointments = await appointmentService.getVetAppointments(vetId);
        
        const prescriptionData = appointments
          .filter(apt => apt.prescription && apt.prescription.trim())
          .map(apt => ({
            id: apt.id,
            petName: apt.pet?.name || 'Unknown Pet',
            ownerName: apt.pet?.owner?.user?.name || 'Unknown Owner',
            prescription: apt.prescription,
            date: new Date(apt.appointmentDate).toLocaleDateString(),
            status: apt.status === 'COMPLETED' ? 'ACTIVE' : 'PENDING',
            diagnosis: apt.notes || 'No diagnosis notes',
            photo: apt.pet?.photo || apt.pet?.photoUrl,
            species: apt.pet?.species
          }));

        setPrescriptions(prescriptionData);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (vetId) {
      fetchPrescriptions();
    }
  }, [vetId]);

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.prescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || prescription.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="vet-prescriptions-section">
      <div className="vet-section-header">
        <h2>Prescriptions 💊</h2>
        <button className="vet-primary-btn">
          <FaPlus /> New Prescription
        </button>
      </div>

      <div className="vet-filters-row">
        <div className="vet-search-container">
          <FaSearch className="vet-search-icon" />
          <input
            type="text"
            placeholder="Search prescriptions... 🔍"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="vet-search-input"
          />
        </div>
      </div>

      <div className="vet-tabs-container mb-6" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
        {[
          { id: 'all', label: 'All 🌟' },
          { id: 'active', label: 'Active 💊' },
          { id: 'pending', label: 'Pending ⏳' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-4 py-2 rounded-lg transition-colors`}
            style={{
              backgroundColor: filterStatus === tab.id ? '#F3E5F5' : 'transparent',
              color: filterStatus === tab.id ? '#9C27B0' : '#666',
              border: 'none',
              borderBottom: filterStatus === tab.id ? '2px solid #9C27B0' : 'none',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
              fontWeight: filterStatus === tab.id ? 'bold' : 'normal'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="vet-loading-spinner">Loading prescriptions...</div>
      ) : prescriptions.length === 0 ? (
        <div className="vet-empty-state">
          <div className="text-6xl mb-4">💊</div>
          <h3>No Prescriptions Yet</h3>
          <p>Prescriptions will appear here when you complete appointments with medication recommendations.</p>
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="vet-empty-state">
          <div className="text-6xl mb-4">🔍</div>
          <h3>No Matching Prescriptions</h3>
          <p>Try adjusting your search terms or filters.</p>
        </div>
      ) : (
        <div className="vet-prescriptions-list">
          {filteredPrescriptions.map((prescription) => (
            <PrescriptionCard key={prescription.id} prescription={prescription} />
          ))}
        </div>
      )}
    </div>
  );
};

// Analytics Section
const AnalyticsSection = ({ user, appointments, patients }) => {
  const [timeRange, setTimeRange] = useState('month');
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const calculateAnalytics = () => {
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const filteredAppointments = appointments.filter(apt => 
        new Date(apt.rawDate) >= startDate
      );

      const totalAppointments = filteredAppointments.length;
      const completedAppointments = filteredAppointments.filter(apt => 
        apt.status === 'completed'
      ).length;
      const cancelledAppointments = filteredAppointments.filter(apt => 
        apt.status === 'cancelled'
      ).length;
      const completionRate = totalAppointments > 0 ? 
        Math.round((completedAppointments / totalAppointments) * 100) : 0;

      const appointmentTypes = {};
      filteredAppointments.forEach(apt => {
        appointmentTypes[apt.type] = (appointmentTypes[apt.type] || 0) + 1;
      });

      const speciesBreakdown = {};
      filteredAppointments.forEach(apt => {
        const species = apt.species || 'Unknown';
        speciesBreakdown[species] = (speciesBreakdown[species] || 0) + 1;
      });

      const avgConsultationFee = 500;
      const estimatedRevenue = completedAppointments * avgConsultationFee;

      setAnalyticsData({
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        completionRate,
        appointmentTypes,
        speciesBreakdown,
        estimatedRevenue,
        totalPatients: patients.length,
        newPatients: Math.floor(patients.length * 0.3)
      });
    };

    calculateAnalytics();
  }, [timeRange, appointments, patients]);

  if (!analyticsData) {
    return <div className="vet-loading-spinner">Loading analytics...</div>;
  }

  const statsCards = [
    { 
      title: 'Total Appointments', 
      value: analyticsData.totalAppointments, 
      icon: '📅', 
      color: '#2196F3',
      change: '+12%'
    },
    { 
      title: 'Completed', 
      value: analyticsData.completedAppointments, 
      icon: '✅', 
      color: '#4CAF50',
      change: '+8%'
    },
    { 
      title: 'Completion Rate', 
      value: `${analyticsData.completionRate}%`, 
      icon: '📊', 
      color: '#9C27B0',
      change: '+5%'
    },
    { 
      title: 'Estimated Revenue', 
      value: `₹${analyticsData.estimatedRevenue.toLocaleString()}`, 
      icon: '💰', 
      color: '#FF9800',
      change: '+15%'
    }
  ];

  return (
    <div className="vet-analytics-section">
      <div className="vet-section-header">
        <h2>Analytics Dashboard 📊</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="vet-select-input"
          style={{ width: 'auto' }}
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="vet-analytics-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {statsCards.map((stat, index) => (
          <div key={index} className="vet-analytics-card" style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderLeft: `4px solid ${stat.color}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                  {stat.title}
                </p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333', margin: 0 }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#4CAF50', marginTop: '0.5rem' }}>
                  {stat.change} from last period
                </p>
              </div>
              <div style={{ fontSize: '2rem' }}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="vet-analytics-chart" style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>Appointment Types</h3>
          {Object.entries(analyticsData.appointmentTypes).length > 0 ? (
            Object.entries(analyticsData.appointmentTypes).map(([type, count]) => (
              <div key={type} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0.75rem 0',
                borderBottom: '1px solid #eee'
              }}>
                <span style={{ color: '#666' }}>{type}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: `${(count / analyticsData.totalAppointments) * 100}px`,
                    height: '8px',
                    backgroundColor: '#9C27B0',
                    borderRadius: '4px'
                  }} />
                  <span style={{ fontWeight: 'bold', color: '#333' }}>{count}</span>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
              No appointment data available
            </p>
          )}
        </div>

        <div className="vet-analytics-chart" style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>Species Treated</h3>
          {Object.entries(analyticsData.speciesBreakdown).length > 0 ? (
            Object.entries(analyticsData.speciesBreakdown).map(([species, count]) => (
              <div key={species} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0.75rem 0',
                borderBottom: '1px solid #eee'
              }}>
                <span style={{ color: '#666' }}>
                  {species === 'Dog' ? '🐶' : species === 'Cat' ? '🐱' : '🐾'} {species}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: `${(count / analyticsData.totalAppointments) * 100}px`,
                    height: '8px',
                    backgroundColor: '#4CAF50',
                    borderRadius: '4px'
                  }} />
                  <span style={{ fontWeight: 'bold', color: '#333' }}>{count}</span>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
              No species data available
            </p>
          )}
        </div>
      </div>

      <div style={{ 
        marginTop: '2rem',
        background: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid #E1BEE7'
      }}>
        <h3 style={{ color: '#7B1FA2', marginBottom: '1rem' }}>📈 Insights & Recommendations</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div style={{ color: '#7B1FA2' }}>
            <strong>🎯 Performance:</strong> Your completion rate of {analyticsData.completionRate}% is {analyticsData.completionRate >= 80 ? 'excellent' : 'good'}!
          </div>
          <div style={{ color: '#7B1FA2' }}>
            <strong>📊 Patient Mix:</strong> You've treated {analyticsData.totalPatients} unique patients this period.
          </div>
          <div style={{ color: '#7B1FA2' }}>
            <strong>💡 Growth:</strong> {analyticsData.newPatients} new patients joined your practice recently.
          </div>
        </div>
      </div>
    </div>
  );
};
*/

// Prescriptions Section
const PrescriptionsSection = ({ user, appointments }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const vetId = user?.vetId || user?.userId || user?.id;

  useEffect(() => {
    const fetchPrescriptions = async () => {
      setLoading(true);
      try {
        // Extract prescriptions from appointments
        const prescriptionData = appointments
          .filter(apt => apt.prescription && apt.prescription.trim())
          .map(apt => ({
            id: apt.id,
            petName: apt.petName,
            ownerName: apt.ownerName,
            prescription: apt.prescription,
            date: apt.date,
            status: apt.status === 'completed' ? 'ACTIVE' : 'PENDING',
            diagnosis: apt.notes || 'No diagnosis notes',
            photo: apt.photo,
            species: apt.species,
            type: apt.type
          }));

        setPrescriptions(prescriptionData);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (vetId && appointments.length > 0) {
      fetchPrescriptions();
    }
  }, [vetId, appointments]);

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.prescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || prescription.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="vet-prescriptions-section">
      <div className="vet-section-header">
        <h2>Prescriptions 💊</h2>
        <button className="vet-primary-btn">
          <FaPlus /> New Prescription
        </button>
      </div>

      <div className="vet-filters-row">
        <div className="vet-search-container">
          <FaSearch className="vet-search-icon" />
          <input
            type="text"
            placeholder="Search prescriptions... 🔍"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="vet-search-input"
          />
        </div>
      </div>

      <div className="vet-tabs-container mb-6" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
        {[
          { id: 'all', label: 'All 🌟' },
          { id: 'active', label: 'Active 💊' },
          { id: 'pending', label: 'Pending ⏳' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-4 py-2 rounded-lg transition-colors`}
            style={{
              backgroundColor: filterStatus === tab.id ? '#F3E5F5' : 'transparent',
              color: filterStatus === tab.id ? '#9C27B0' : '#666',
              border: 'none',
              borderBottom: filterStatus === tab.id ? '2px solid #9C27B0' : 'none',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
              fontWeight: filterStatus === tab.id ? 'bold' : 'normal'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="vet-loading-spinner">Loading prescriptions...</div>
      ) : prescriptions.length === 0 ? (
        <div className="vet-empty-state">
          <div className="text-6xl mb-4">💊</div>
          <h3>No Prescriptions Yet</h3>
          <p>Prescriptions will appear here when you complete appointments with medication recommendations.</p>
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#F3E5F5', borderRadius: '8px', maxWidth: '400px', margin: '1.5rem auto 0' }}>
            <p style={{ fontSize: '0.9rem', color: '#7B1FA2', margin: 0 }}>
              💡 <strong>Tip:</strong> Add prescriptions when completing appointments in the Appointments section.
            </p>
          </div>
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="vet-empty-state">
          <div className="text-6xl mb-4">🔍</div>
          <h3>No Matching Prescriptions</h3>
          <p>Try adjusting your search terms or filters.</p>
        </div>
      ) : (
        <div className="vet-prescriptions-list">
          {filteredPrescriptions.map((prescription) => (
            <PrescriptionCard key={prescription.id} prescription={prescription} />
          ))}
        </div>
      )}
    </div>
  );
};

// Prescription Card Component
const PrescriptionCard = ({ prescription }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'completed': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  return (
    <div className="vet-prescription-card" style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '1rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${getStatusColor(prescription.status)}`
    }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        {/* Pet Image */}
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          overflow: 'hidden',
          flexShrink: 0,
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {prescription.photo ? (
            <img
              src={`http://localhost:8080${prescription.photo}`}
              alt={prescription.petName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontSize: '1.5rem' }}>
              {prescription.species === 'Dog' ? '🐶' : prescription.species === 'Cat' ? '🐱' : '🐾'}
            </span>
          )}
        </div>

        {/* Prescription Details */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, color: '#333', fontSize: '1.2rem' }}>{prescription.petName}</h3>
            <span style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              color: 'white',
              backgroundColor: getStatusColor(prescription.status)
            }}>
              {prescription.status}
            </span>
          </div>
          
          <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.9rem' }}>
            <strong>Owner:</strong> {prescription.ownerName}
          </p>
          
          <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.9rem' }}>
            <strong>Date:</strong> {prescription.date} • <strong>Type:</strong> {prescription.type}
          </p>

          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            backgroundColor: '#F8F9FA', 
            borderRadius: '8px',
            border: '1px solid #E9ECEF'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#7B1FA2', fontSize: '1rem' }}>💊 Prescription</h4>
            <p style={{ margin: 0, color: '#333', lineHeight: '1.5' }}>
              {prescription.prescription}
            </p>
          </div>

          {prescription.diagnosis && prescription.diagnosis !== 'No diagnosis notes' && (
            <div style={{ 
              marginTop: '0.75rem', 
              padding: '0.75rem', 
              backgroundColor: '#FFF3E0', 
              borderRadius: '8px',
              border: '1px solid #FFE0B2'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#F57C00', fontSize: '0.9rem' }}>📋 Diagnosis</h4>
              <p style={{ margin: 0, color: '#333', fontSize: '0.9rem', lineHeight: '1.4' }}>
                {prescription.diagnosis}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Analytics Section
const AnalyticsSection = ({ user, appointments, patients }) => {
  const [timeRange, setTimeRange] = useState('month');
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const calculateAnalytics = () => {
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const filteredAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.rawDate || apt.date);
        return aptDate >= startDate;
      });

      const totalAppointments = filteredAppointments.length;
      const completedAppointments = filteredAppointments.filter(apt => 
        apt.status === 'completed'
      ).length;
      const cancelledAppointments = filteredAppointments.filter(apt => 
        apt.status === 'cancelled'
      ).length;
      const pendingAppointments = filteredAppointments.filter(apt => 
        apt.status === 'pending' || apt.status === 'confirmed'
      ).length;
      const completionRate = totalAppointments > 0 ? 
        Math.round((completedAppointments / totalAppointments) * 100) : 0;

      const appointmentTypes = {};
      filteredAppointments.forEach(apt => {
        appointmentTypes[apt.type] = (appointmentTypes[apt.type] || 0) + 1;
      });

      const speciesBreakdown = {};
      filteredAppointments.forEach(apt => {
        const species = apt.species || 'Unknown';
        speciesBreakdown[species] = (speciesBreakdown[species] || 0) + 1;
      });

      // Calculate revenue (mock calculation)
      const avgConsultationFee = 500; // ₹500 per consultation
      const estimatedRevenue = completedAppointments * avgConsultationFee;

      // Calculate patient metrics
      const totalPatients = patients.length;
      const newPatients = Math.floor(totalPatients * 0.3); // Assume 30% are new

      setAnalyticsData({
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        pendingAppointments,
        completionRate,
        appointmentTypes,
        speciesBreakdown,
        estimatedRevenue,
        totalPatients,
        newPatients,
        timeRange
      });
    };

    calculateAnalytics();
  }, [timeRange, appointments, patients]);

  if (!analyticsData) {
    return <div className="vet-loading-spinner">Loading analytics...</div>;
  }

  const statsCards = [
    { 
      title: 'Total Appointments', 
      value: analyticsData.totalAppointments, 
      icon: '📅', 
      color: '#2196F3',
      change: '+12%',
      subtitle: `${analyticsData.pendingAppointments} pending`
    },
    { 
      title: 'Completed', 
      value: analyticsData.completedAppointments, 
      icon: '✅', 
      color: '#4CAF50',
      change: '+8%',
      subtitle: `${analyticsData.completionRate}% completion rate`
    },
    { 
      title: 'Total Patients', 
      value: analyticsData.totalPatients, 
      icon: '🐾', 
      color: '#9C27B0',
      change: '+15%',
      subtitle: `${analyticsData.newPatients} new patients`
    },
    { 
      title: 'Estimated Revenue', 
      value: `₹${analyticsData.estimatedRevenue.toLocaleString()}`, 
      icon: '💰', 
      color: '#FF9800',
      change: '+20%',
      subtitle: `₹500 avg per consultation`
    }
  ];

  return (
    <div className="vet-analytics-section">
      <div className="vet-section-header">
        <h2>Analytics Dashboard 📊</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="vet-select-input"
          style={{ width: 'auto' }}
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="vet-analytics-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {statsCards.map((stat, index) => (
          <div key={index} className="vet-analytics-card" style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderLeft: `4px solid ${stat.color}`,
            transition: 'transform 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem', fontWeight: '500' }}>
                  {stat.title}
                </p>
                <p style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#333', margin: '0.5rem 0' }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#4CAF50', marginBottom: '0.25rem', fontWeight: '600' }}>
                  {stat.change} from last period
                </p>
                <p style={{ fontSize: '0.8rem', color: '#888', margin: 0 }}>
                  {stat.subtitle}
                </p>
              </div>
              <div style={{ fontSize: '2.5rem', opacity: 0.8 }}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Appointment Types Chart */}
        <div className="vet-analytics-chart" style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#333', fontSize: '1.2rem', fontWeight: 'bold' }}>
            📋 Appointment Types
          </h3>
          {Object.entries(analyticsData.appointmentTypes).length > 0 ? (
            <div>
              {Object.entries(analyticsData.appointmentTypes).map(([type, count]) => {
                const percentage = Math.round((count / analyticsData.totalAppointments) * 100);
                return (
                  <div key={type} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <span style={{ color: '#666', fontWeight: '500' }}>{type}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '100px',
                        height: '8px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          backgroundColor: '#9C27B0',
                          borderRadius: '4px',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <span style={{ fontWeight: 'bold', color: '#333', minWidth: '40px' }}>
                        {count} ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <p>No appointment data available for the selected period</p>
            </div>
          )}
        </div>

        {/* Species Breakdown Chart */}
        <div className="vet-analytics-chart" style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#333', fontSize: '1.2rem', fontWeight: 'bold' }}>
            🐾 Species Treated
          </h3>
          {Object.entries(analyticsData.speciesBreakdown).length > 0 ? (
            <div>
              {Object.entries(analyticsData.speciesBreakdown).map(([species, count]) => {
                const percentage = Math.round((count / analyticsData.totalAppointments) * 100);
                const speciesIcon = species === 'Dog' ? '🐶' : species === 'Cat' ? '🐱' : '🐾';
                return (
                  <div key={species} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <span style={{ color: '#666', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>{speciesIcon}</span>
                      {species}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '100px',
                        height: '8px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          backgroundColor: species === 'Dog' ? '#FF9800' : species === 'Cat' ? '#E91E63' : '#9C27B0',
                          borderRadius: '4px',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <span style={{ fontWeight: 'bold', color: '#333', minWidth: '40px' }}>
                        {count} ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐾</div>
              <p>No species data available for the selected period</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Section */}
      <div style={{
        background: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid #D1C4E9'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#7B1FA2', fontSize: '1.2rem' }}>
          📈 Performance Summary ({timeRange === 'week' ? 'This Week' : timeRange === 'month' ? 'This Month' : 'This Year'})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <p style={{ margin: '0.25rem 0', color: '#7B1FA2', fontWeight: '600' }}>
              🎯 Completion Rate: <strong>{analyticsData.completionRate}%</strong>
            </p>
            <p style={{ margin: '0.25rem 0', color: '#7B1FA2', fontSize: '0.9rem' }}>
              {analyticsData.completedAppointments} completed out of {analyticsData.totalAppointments} total
            </p>
          </div>
          <div>
            <p style={{ margin: '0.25rem 0', color: '#7B1FA2', fontWeight: '600' }}>
              💰 Revenue: <strong>₹{analyticsData.estimatedRevenue.toLocaleString()}</strong>
            </p>
            <p style={{ margin: '0.25rem 0', color: '#7B1FA2', fontSize: '0.9rem' }}>
              Average ₹500 per consultation
            </p>
          </div>
          <div>
            <p style={{ margin: '0.25rem 0', color: '#7B1FA2', fontWeight: '600' }}>
              🐾 Patients: <strong>{analyticsData.totalPatients}</strong>
            </p>
            <p style={{ margin: '0.25rem 0', color: '#7B1FA2', fontSize: '0.9rem' }}>
              {analyticsData.newPatients} new patients this period
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Profile Modal Component
const EditProfileModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialty: user?.specialty || '',
    license: user?.license || '',
    experience: user?.experience || '',
    clinicAddress: user?.clinicAddress || ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Here you would typically call an API to update the profile
      // For now, we'll just simulate the save
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSave(formData);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vet-modal-overlay" onClick={onClose}>
      <div className="vet-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="vet-modal-header">
          <h3>✏️ Edit Profile</h3>
          <button onClick={onClose} className="vet-close-btn">
            <FaTimes />
          </button>
        </div>

        <div className="vet-modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="block text-sm font-semibold mb-2">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg"
                placeholder="+1-555-0123"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Specialty</label>
              <select
                name="specialty"
                value={formData.specialty}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">Select specialty...</option>
                <option value="General Practice">General Practice</option>
                <option value="Surgery">Surgery</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Emergency Medicine">Emergency Medicine</option>
                <option value="Internal Medicine">Internal Medicine</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">License Number</label>
              <input
                type="text"
                name="license"
                value={formData.license}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg"
                placeholder="VET001"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Years of Experience</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg"
                min="0"
                max="50"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-semibold mb-2">Clinic Address</label>
            <textarea
              name="clinicAddress"
              value={formData.clinicAddress}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg"
              rows="3"
              placeholder="123 Pet Care Street, City, State 12345"
            />
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button onClick={onClose} className="vet-secondary-btn">
              Cancel
            </button>
            <button onClick={handleSave} disabled={loading} className="vet-primary-btn">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// View Schedule Modal Component
const ViewScheduleModal = ({ user, onClose }) => {
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const vetId = user?.vetId || user?.userId || user?.id;

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        // Fetch appointments for the selected date
        const appointments = await appointmentService.getVetAppointments(vetId);
        
        // Filter appointments for selected date
        const selectedDateAppointments = appointments.filter(apt => {
          const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
          return aptDate === selectedDate;
        });

        // Sort by time
        const sortedAppointments = selectedDateAppointments.sort((a, b) => 
          new Date(a.appointmentDate) - new Date(b.appointmentDate)
        );

        setScheduleData(sortedAppointments);
      } catch (error) {
        console.error('Error fetching schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    if (vetId) {
      fetchSchedule();
    }
  }, [vetId, selectedDate]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <div className="vet-modal-overlay" onClick={onClose}>
      <div className="vet-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '80vh', overflow: 'auto' }}>
        <div className="vet-modal-header">
          <h3>📅 My Schedule</h3>
          <button onClick={onClose} className="vet-close-btn">
            <FaTimes />
          </button>
        </div>

        <div className="vet-modal-body">
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-2 border rounded-lg"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="vet-loading-spinner">Loading schedule...</div>
            </div>
          ) : scheduleData.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📅</div>
              <h3>No Appointments</h3>
              <p>No appointments scheduled for {new Date(selectedDate).toLocaleDateString()}</p>
            </div>
          ) : (
            <div>
              <h4 className="mb-4 font-bold text-lg">
                Appointments for {new Date(selectedDate).toLocaleDateString()} ({scheduleData.length})
              </h4>
              
              <div className="space-y-3">
                {scheduleData.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 border rounded-lg"
                    style={{ borderLeft: `4px solid ${getStatusColor(appointment.status)}` }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-semibold text-lg">
                          {appointment.pet?.name || 'Unknown Pet'}
                        </h5>
                        <p className="text-gray-600">
                          Owner: {appointment.pet?.owner?.user?.name || 'Unknown Owner'}
                        </p>
                        <p className="text-sm text-gray-500">
                          🕐 {new Date(appointment.appointmentDate).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                        <p className="text-sm text-gray-500">
                          📋 {appointment.type} • {appointment.reason || 'No reason specified'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                          style={{ backgroundColor: getStatusColor(appointment.status) }}
                        >
                          {appointment.status}
                        </span>
                        {appointment.meetingLink && (
                          <div className="mt-2">
                            <a
                              href={appointment.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              📹 Join Meeting
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button onClick={onClose} className="vet-primary-btn">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VetDashboard;