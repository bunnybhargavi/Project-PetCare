import React, { useState, useEffect } from 'react';
import { 
  FaStethoscope, FaCalendarAlt, FaUserMd, FaClipboardList,
  FaSyringe, FaPrescriptionBottle, FaSearch, FaTimes,
  FaPhone, FaEnvelope, FaPaw, FaEdit, FaEye,
  FaClock, FaCheckCircle, FaExclamationTriangle, FaPlus,
  FaChartBar, FaBell, FaFileAlt, FaUsers
} from 'react-icons/fa';
import './VetDashboard.css';

// Mock data - replace with actual API calls
const mockAppointments = [
  { id: 1, petName: 'Max', ownerName: 'Sarah Johnson', time: '10:00 AM', date: '2024-12-15', type: 'Checkup', status: 'scheduled' },
  { id: 2, petName: 'Luna', ownerName: 'Mike Brown', time: '11:30 AM', date: '2024-12-15', type: 'Vaccination', status: 'scheduled' },
  { id: 3, petName: 'Charlie', ownerName: 'Emma Davis', time: '2:00 PM', date: '2024-12-15', type: 'Surgery', status: 'in-progress' },
];

const mockPatients = [
  { id: 1, name: 'Max', species: 'Dog', breed: 'Golden Retriever', age: 3, owner: 'Sarah Johnson', lastVisit: '2024-11-20', imageUrl: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400' },
  { id: 2, name: 'Luna', species: 'Cat', breed: 'Persian', age: 2, owner: 'Mike Brown', lastVisit: '2024-11-25', imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400' },
  { id: 3, name: 'Charlie', species: 'Dog', breed: 'Beagle', age: 5, owner: 'Emma Davis', lastVisit: '2024-12-01', imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400' },
];

const VetDashboard = () => {
  const [user] = useState({ name: 'Dr. Emily Parker', specialty: 'Small Animal Medicine', license: 'VET-12345' });
  const [activeSection, setActiveSection] = useState('overview');
  const [appointments, setAppointments] = useState(mockAppointments);
  const [patients, setPatients] = useState(mockPatients);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientDetail, setShowPatientDetail] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [stats, setStats] = useState({
    todayAppointments: 8,
    totalPatients: 127,
    pendingRecords: 5,
    urgentCases: 2
  });

  const carouselImages = [
    'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1200',
    'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=1200',
    'https://images.unsplash.com/photo-1530041539828-114de669390e?w=1200',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const menuItems = [
    { id: 'overview', icon: FaStethoscope, label: 'Overview', emoji: '🏥' },
    { id: 'appointments', icon: FaCalendarAlt, label: 'Appointments', emoji: '📅' },
    { id: 'patients', icon: FaPaw, label: 'Patients', emoji: '🐾' },
    { id: 'records', icon: FaClipboardList, label: 'Records', emoji: '📋' },
    { id: 'prescriptions', icon: FaPrescriptionBottle, label: 'Prescriptions', emoji: '💊' },
    { id: 'analytics', icon: FaChartBar, label: 'Analytics', emoji: '📊' },
    { id: 'profile', icon: FaUserMd, label: 'Profile', emoji: '👨‍⚕️' },
  ];

  const statsData = [
    { emoji: '📅', label: 'Today\'s Appointments', value: stats.todayAppointments, color: '#C3E5FF', icon: FaCalendarAlt },
    { emoji: '🐾', label: 'Total Patients', value: stats.totalPatients, color: '#FFB3D9', icon: FaPaw },
    { emoji: '📋', label: 'Pending Records', value: stats.pendingRecords, color: '#FFF9C4', icon: FaFileAlt },
    { emoji: '⚠️', label: 'Urgent Cases', value: stats.urgentCases, color: '#FFCDD2', icon: FaExclamationTriangle },
  ];

  return (
    <div className="vet-dashboard-container">
      {/* Hero Section */}
      <div className="vet-hero-section">
        <div 
          className="vet-hero-background"
          style={{ backgroundImage: `url(${carouselImages[currentImageIndex]})` }}
        />
        <div className="vet-hero-overlay" />
        
        <div className="floating-element" style={{ top: '15%', right: '10%' }}>🩺</div>
        <div className="floating-element" style={{ bottom: '25%', left: '8%', animationDelay: '2s' }}>💉</div>
        <div className="floating-element" style={{ top: '40%', right: '5%', animationDelay: '1s' }}>🐾</div>
        
        <div className="vet-hero-content">
          <h1 className="vet-hero-title">
            Welcome, {user?.name}! 🩺
          </h1>
          <p className="vet-hero-subtitle">
            Providing exceptional care, one paw at a time 💙
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

        <div className="vet-indicators">
          {carouselImages.map((_, index) => (
            <div
              key={index}
              className={`vet-dot ${currentImageIndex === index ? 'vet-dot-active' : ''}`}
            />
          ))}
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
              setActiveSection={setActiveSection}
            />
          )}
          {activeSection === 'appointments' && (
            <AppointmentsSection appointments={appointments} />
          )}
          {activeSection === 'patients' && (
            <PatientsSection 
              patients={patients}
              setSelectedPatient={setSelectedPatient}
              setShowPatientDetail={setShowPatientDetail}
            />
          )}
          {activeSection === 'records' && <ComingSoonSection icon="📋" title="Medical Records" />}
          {activeSection === 'prescriptions' && <ComingSoonSection icon="💊" title="Prescriptions" />}
          {activeSection === 'analytics' && <ComingSoonSection icon="📊" title="Analytics" />}
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
    </div>
  );
};

// Overview Section
const OverviewSection = ({ appointments, patients, setActiveSection }) => {
  const todayAppointments = appointments.filter(apt => apt.date === '2024-12-15');
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
        {todayAppointments.map((apt) => (
          <AppointmentCard key={apt.id} appointment={apt} compact />
        ))}
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
const AppointmentsSection = ({ appointments }) => {
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
        <button className="vet-primary-btn">
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
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="vet-select-input"
        >
          <option value="all">All Status 🌟</option>
          <option value="scheduled">Scheduled ⏰</option>
          <option value="in-progress">In Progress 🔄</option>
          <option value="completed">Completed ✅</option>
        </select>
      </div>

      <div className="vet-appointments-list">
        {filteredAppointments.map((apt) => (
          <AppointmentCard key={apt.id} appointment={apt} />
        ))}
      </div>
    </div>
  );
};

// Appointment Card
const AppointmentCard = ({ appointment, compact = false }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'scheduled': return '#4CAF50';
      case 'in-progress': return '#FF9800';
      case 'completed': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'scheduled': return <FaClock />;
      case 'in-progress': return <FaExclamationTriangle />;
      case 'completed': return <FaCheckCircle />;
      default: return null;
    }
  };

  return (
    <div className={`vet-appointment-card ${compact ? 'compact' : ''}`}>
      <div className="vet-appointment-status" style={{ backgroundColor: getStatusColor(appointment.status) }}>
        {getStatusIcon(appointment.status)}
      </div>
      <div className="vet-appointment-content">
        <div className="vet-appointment-header">
          <h3>{appointment.petName}</h3>
          <span className="vet-appointment-type">{appointment.type}</span>
        </div>
        <p className="vet-appointment-owner">Owner: {appointment.ownerName}</p>
        <div className="vet-appointment-time">
          <FaClock /> {appointment.time} - {appointment.date}
        </div>
      </div>
      <div className="vet-appointment-actions">
        <button className="vet-icon-btn">
          <FaEye />
        </button>
        <button className="vet-icon-btn">
          <FaEdit />
        </button>
      </div>
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
        <button className="vet-primary-btn">
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
const PatientCard = ({ patient, onClick }) => (
  <div className="vet-patient-card" onClick={onClick}>
    <div className="vet-patient-image">
      {patient.imageUrl ? (
        <img src={patient.imageUrl} alt={patient.name} />
      ) : (
        <div className="vet-patient-image-placeholder">
          {patient.species === 'Dog' ? '🐶' : '🐱'}
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

// Coming Soon Section
const ComingSoonSection = ({ icon, title }) => (
  <div className="vet-coming-soon">
    <div className="vet-coming-soon-emoji">{icon}</div>
    <h2>{title}</h2>
    <p>Feature coming soon! 🚀</p>
  </div>
);

// Profile Section
const ProfileSection = ({ user }) => (
  <div className="vet-profile-section">
    <div className="vet-profile-card">
      <div className="vet-profile-avatar">
        <FaUserMd />
      </div>
      <h2>{user.name}</h2>
      <p className="vet-profile-specialty">{user.specialty}</p>
      <p className="vet-profile-license">License: {user.license}</p>
      <div className="vet-profile-actions">
        <button className="vet-primary-btn">Edit Profile</button>
        <button className="vet-secondary-btn">View Schedule</button>
      </div>
    </div>
  </div>
);

// Patient Detail Modal
const PatientDetailModal = ({ patient, onClose }) => {
  const [activeTab, setActiveTab] = useState('info');

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
                <img src={patient.imageUrl || 'https://via.placeholder.com/400'} alt={patient.name} />
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
              <p>Medical history will be displayed here...</p>
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

export default VetDashboard;