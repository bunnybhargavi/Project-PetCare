import React, { useEffect, useMemo, useState } from 'react'; // Owner Dashboard Component
import {
  FaBell,
  FaCalendarAlt,
  FaChartLine,
  FaHeart,
  FaPlus,
  FaSearch,
  FaShoppingCart,
  FaTimes,
  FaUser,
  FaTrash,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { petService } from '../../services/petService';
import { medicalRecordService } from '../../services/medicalRecordService';
import { vaccinationService } from '../../services/vaccinationService';
import { healthService } from '../../services/healthService';
import { reminderService } from '../../services/reminderService';
import AddPetModal from '../Pets/AddPetModal';
import PetProfile from '../Pets/PetProfile';
import { appointmentService } from '../../services/appointmentService';
import { vetService } from '../../services/vetService';
import styles from './OwnerDashboard.module.css';

const carouselImages = [
  'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1200',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200',
  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1200',
];

const formatGender = (gender) => {
  if (!gender) return '⚪ Unknown';
  const normalized = gender.toUpperCase();
  if (normalized === 'MALE') return '♂️ Male';
  if (normalized === 'FEMALE') return '♀️ Female';
  return '⚪ Unknown';
};

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const diff = Date.now() - dob.getTime();
  return Math.max(0, new Date(diff).getUTCFullYear() - 1970);
};

const OwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadingPets, setLoadingPets] = useState(true);
  const [error, setError] = useState('');
  const [navBadges, setNavBadges] = useState({
    pets: 0,
    health: 0,
    reminders: 0,
    appointments: 0
  });
  // no demo button; sample data seeded automatically when empty

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Carousel animation
  useEffect(() => {
    const timer = setInterval(
      () => setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length),
      5000
    );
    return () => clearInterval(timer);
  }, []);

  // Load pets from API and ensure sample data if empty
  useEffect(() => {
    if (!user) return;
    const fetchPets = async () => {
      try {
        setLoadingPets(true);
        setError('');
        const data = await petService.getAllPets();
        const list = Array.isArray(data) ? data : [];
        setPets(list);

      } catch (err) {
        console.error('Failed to load pets', err);
        setError(err.response?.data?.message || 'Unable to load your pets right now.');

      } finally {
        setLoadingPets(false);
      }
    };

    fetchPets();
  }, [user]);

  // Fetch navbar badge counts
  useEffect(() => {
    const fetchNavBadges = async () => {
      if (pets.length === 0) return;

      try {
        let totalReminders = 0;
        let healthAlerts = 0;
        let totalAppointments = 0;

        for (const pet of pets) {
          // Get reminders
          const reminders = await reminderService.getRemindersByPet(pet.id).catch(() => []);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const upcomingReminders = reminders.filter(r => {
            const reminderDate = new Date(r.dueDate);
            return reminderDate >= today;
          });
          totalReminders += upcomingReminders.length;

          // Get appointments
          const appointments = await appointmentService.getPetAppointments(pet.id).catch(() => []);
          const upcomingAppointments = appointments.filter(a => {
            const appointmentDate = new Date(a.appointmentDate);
            return appointmentDate >= today;
          });
          totalAppointments += upcomingAppointments.length;
        }

        // Count health alerts
        healthAlerts = pets.filter(pet =>
          ['DUE_SOON', 'OVERDUE', 'UNDER_TREATMENT'].includes((pet.healthStatus || '').toUpperCase())
        ).length;

        setNavBadges({
          pets: pets.length,
          health: healthAlerts,
          reminders: totalReminders,
          appointments: totalAppointments
        });
      } catch (error) {
        console.error('Failed to fetch nav badges:', error);
      }
    };

    fetchNavBadges();
  }, [pets]);

  const handleAddPet = async (payload) => {
    // payload has { petData, photoFile }
    const createdPet = await petService.createPet(payload.petData);
    // If there's a photo file, upload it
    if (payload.photoFile && createdPet.id) {
      try {
        await petService.uploadPetImage(createdPet.id, payload.photoFile);
        // Refresh to get updated pet with photo URL
        const updatedPet = await petService.getPetById(createdPet.id);
        setPets((prev) => [...prev.filter(p => p.id !== createdPet.id), updatedPet]);
        return updatedPet;
      } catch (err) {
        console.error('Failed to upload pet photo', err);
      }
    }
    setPets((prev) => [...prev, createdPet]);
    return createdPet;
  };

  const handleDeletePet = async (petId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this pet?')) {
      try {
        await petService.deletePet(petId);
        setPets((prev) => prev.filter((p) => p.id !== petId));
      } catch (err) {
        console.error('Failed to delete pet', err);
        alert('Failed to delete pet');
      }
    }
  };



  const stats = useMemo(() => {
    const healthAlerts = pets.filter((pet) =>
      ['DUE_SOON', 'OVERDUE'].includes((pet.healthStatus || '').toUpperCase())
    ).length;
    const totalWalkStreak = pets.reduce((sum, pet) => sum + (pet.walkStreak || 0), 0);
    const profilesWithNotes = pets.filter((pet) => pet.notes).length;

    return [
      { emoji: '🐾', label: 'My Pets', value: pets.length, color: '#FFB3D9' },
      { emoji: '📊', label: 'Health Alerts', value: healthAlerts, color: '#D5F4E6' },
      { emoji: '🏃', label: 'Walk Streaks', value: totalWalkStreak, color: '#C3E5FF' },
      { emoji: '📝', label: 'Profiles Updated', value: profilesWithNotes, color: '#FFF9C4' },
    ];
  }, [pets]);

  const menuItems = [
    { id: 'overview', icon: FaHeart, label: 'Overview', emoji: '🏠', badge: null },
    { id: 'pets', icon: FaHeart, label: 'My Pets', emoji: '🐾', badge: navBadges.pets },
    { id: 'appointments', icon: FaCalendarAlt, label: 'Appointments', emoji: '📅', badge: navBadges.appointments },
    { id: 'health', icon: FaChartLine, label: 'Health', emoji: '📊', badge: navBadges.health },
    { id: 'reminders', icon: FaBell, label: 'Reminders', emoji: '🔔', badge: navBadges.reminders },
    { id: 'marketplace', icon: FaShoppingCart, label: 'Shop', emoji: '🛒', badge: null },
    { id: 'profile', icon: FaUser, label: 'Profile', emoji: '👤', badge: null },
  ];

  return (
    <div className={styles.dashboardContainer}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div
          className={styles.heroBackground}
          style={{ backgroundImage: `url(${carouselImages[currentImageIndex]})` }}
        />
        <div className={styles.heroOverlay} />

        {/* Floating Paws Animation */}
        <div className={styles.floatingPaw} style={{ top: '10%', right: '10%' }}>
          🐾
        </div>
        <div
          className={styles.floatingPaw}
          style={{ bottom: '20%', left: '5%', animationDelay: '2s' }}
        >
          ✨
        </div>

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Welcome, {user?.name || 'Pet Parent'}! 🐾</h1>
          <p className={styles.heroSubtitle}>Where every tail wag and purr matters! 💕</p>

          <div className={styles.heroButtons}>
            <button onClick={() => setActiveSection('pets')} className={styles.primaryBtn}>
              <FaHeart /> Manage Pets
            </button>
            <button onClick={() => setShowAddPetModal(true)} className={styles.secondaryBtn}>
              <FaPlus /> Add New Pet
            </button>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className={styles.indicators}>
          {carouselImages.map((_, index) => (
            <div
              key={index}
              className={`${styles.dot} ${currentImageIndex === index ? styles.dotActive : ''}`}
            />
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {error && <div className={styles.errorBanner}>{error}</div>}
        {loadingPets && <div className={styles.loadingState}>Loading your pets...</div>}

        {/* Quick Stats Grid */}
        <div className={styles.statsGrid}>
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className={styles.statCard}
              style={{ borderBottom: `4px solid ${stat.color}` }}
            >
              <div>
                <p className={styles.statLabel}>{stat.label}</p>
                <p className={styles.statValue}>{stat.value}</p>
              </div>
              <div className="text-4xl animate-bounce">{stat.emoji}</div>
            </div>
          ))}
        </div>

        {/* Sticky Navbar */}
        <nav className={styles.navContainer}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasBadge = item.badge !== null && item.badge !== undefined && item.badge > 0;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`${styles.navItem} ${activeSection === item.id ? styles.navItemActive : ''
                  }`}
                style={{ position: 'relative' }}
              >
                <Icon />
                {item.label}
                {hasBadge && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'linear-gradient(135deg, #FF6B9D 0%, #C239B3 100%)',
                      color: 'white',
                      borderRadius: '12px',
                      padding: '2px 6px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      minWidth: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(255, 107, 157, 0.4)',
                      animation: item.id === 'reminders' ? 'pulse 2s infinite' : 'none'
                    }}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Dynamic Content Sections */}
        <div className="animate-fade-in">
          {activeSection === 'overview' && <OverviewSection pets={pets} styles={styles} />}
          {activeSection === 'pets' && (
            <PetsSection
              pets={pets}
              loading={loadingPets}
              setSelectedPet={setSelectedPet}
              setShowAddPetModal={setShowAddPetModal}
              onDelete={handleDeletePet}
              styles={styles}
            />
          )}
          {activeSection === 'appointments' && (
            <AppointmentsSection pets={pets} styles={styles} />
          )}
          {activeSection === 'health' && (
            <HealthSection pets={pets} styles={styles} />
          )}
          {activeSection === 'reminders' && (
            <RemindersSection pets={pets} styles={styles} />
          )}
          {activeSection === 'marketplace' && (
            <ComingSoonSection icon="🛒" title="Marketplace" styles={styles} />
          )}
          {activeSection === 'profile' && <ProfileSection user={user} navigate={navigate} styles={styles} />}
        </div>
      </div>

      {/* Modals */}
      {showAddPetModal && (
        <AddPetModal
          isOpen={showAddPetModal}
          onClose={() => setShowAddPetModal(false)}
          onAdd={handleAddPet}
        />
      )}

      {selectedPet && (
        <PetProfile
          pet={selectedPet}
          onClose={() => setSelectedPet(null)}
          onUpdate={async () => {
            // Refresh pets list after update
            const data = await petService.getAllPets();
            setPets(Array.isArray(data) ? data : []);
          }}
        />
      )}
    </div>
  );
};

// --- Sub Components ---

const OverviewSection = ({ pets, styles }) => {
  const [overviewData, setOverviewData] = React.useState({
    totalMedicalRecords: 0,
    totalVaccinations: 0,
    upcomingReminders: 0,
    recentActivities: [],
    loading: true
  });

  React.useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        // Fetch data for all pets
        const allMedicalRecords = [];
        const allVaccinations = [];
        const allReminders = [];

        for (const pet of pets) {
          const [records, vaccinations, reminders] = await Promise.all([
            medicalRecordService.getRecordsByPet(pet.id).catch(() => []),
            vaccinationService.getVaccinationsByPet(pet.id).catch(() => []),
            reminderService.getRemindersByPet(pet.id).catch(() => [])
          ]);

          allMedicalRecords.push(...records);
          allVaccinations.push(...vaccinations);
          allReminders.push(...reminders);
        }

        // Count upcoming reminders (next 7 days)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const upcoming = allReminders.filter(r => {
          const reminderDate = new Date(r.dueDate);
          return reminderDate >= today && reminderDate <= nextWeek;
        });

        // Get recent activities (last 5 medical records + vaccinations)
        const activities = [
          ...allMedicalRecords.map(r => ({ type: 'medical', date: r.visitDate, title: r.recordType, petId: r.petId })),
          ...allVaccinations.map(v => ({ type: 'vaccination', date: v.dateGiven, title: v.vaccineName, petId: v.petId }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

        setOverviewData({
          totalMedicalRecords: allMedicalRecords.length,
          totalVaccinations: allVaccinations.length,
          upcomingReminders: upcoming.length,
          recentActivities: activities,
          loading: false
        });
      } catch (error) {
        console.error('Failed to fetch overview data:', error);
        setOverviewData(prev => ({ ...prev, loading: false }));
      }
    };

    if (pets.length > 0) {
      fetchOverviewData();
    }
  }, [pets]);

  const quickStats = [
    {
      emoji: '🐾',
      title: 'My Pets',
      value: pets.length,
      description: pets.length === 1 ? '1 furry friend' : `${pets.length} furry friends`,
      color: '#FFB3D9',
      action: 'pets'
    },
    {
      emoji: '📊',
      title: 'Medical Records',
      value: overviewData.totalMedicalRecords,
      description: 'Total health records',
      color: '#C3E5FF',
      action: 'health'
    },
    {
      emoji: '💉',
      title: 'Vaccinations',
      value: overviewData.totalVaccinations,
      description: 'Vaccines administered',
      color: '#D5F4E6',
      action: 'health'
    },
    {
      emoji: '🔔',
      title: 'Upcoming',
      value: overviewData.upcomingReminders,
      description: 'Reminders this week',
      color: '#FFF9C4',
      action: 'reminders'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--primary-color)' }}>
          Dashboard Overview 🌟
        </h2>
        <p className="text-gray-600">Your pet care journey at a glance</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${stat.color}40 0%, ${stat.color}20 100%)`,
              border: `2px solid ${stat.color}`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">{stat.title}</p>
                <p className="text-4xl font-bold mb-1" style={{ color: 'var(--primary-color)' }}>
                  {overviewData.loading ? '...' : stat.value}
                </p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
              <div className="text-5xl">{stat.emoji}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      {overviewData.recentActivities.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--primary-color)' }}>
            ⚡ Recent Activity
          </h3>
          <div className="space-y-3">
            {overviewData.recentActivities.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.type === 'medical' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                  {activity.type === 'medical' ? '🏥' : '💉'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{activity.title}</p>
                  <p className="text-sm text-gray-500">
                    {activity.type === 'medical' ? 'Medical Record' : 'Vaccination'}
                  </p>
                </div>
                <span className="text-xs text-gray-400">{activity.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Your Pets Section */}
      <div>
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--primary-color)' }}>
          🐾 Your Adorable Companions
        </h3>
        {pets.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <p className="text-6xl mb-4">🐕</p>
            <h4 className="text-xl font-bold text-gray-700 mb-2">No Pets Yet</h4>
            <p className="text-gray-500 mb-6">Add your first furry friend to get started!</p>
          </div>
        ) : (
          <div className={styles.cardGrid}>
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} styles={styles} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PetsSection = ({ pets, loading, setSelectedPet, setShowAddPetModal, onDelete, styles }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('all');

  const filteredPets = pets.filter((pet) => {
    const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterSpecies === 'all' ||
      (pet.species || '').toLowerCase() === filterSpecies.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className="text-3xl font-bold" style={{ color: 'var(--primary-color)' }}>
            My Pets 🐾
          </h2>
        </div>
        <button onClick={() => setShowAddPetModal(true)} className={styles.primaryBtn}>
          <FaPlus /> Add Pet
        </button>
      </div>

      <div className="flex gap-4 mb-6 flex-wrap md:flex-nowrap">
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search pets... 🔍"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <select
          value={filterSpecies}
          onChange={(e) => setFilterSpecies(e.target.value)}
          className={styles.selectInput}
          style={{ width: 'auto' }}
        >
          <option value="all">All Species 🌟</option>
          <option value="Dog">Dogs 🐶</option>
          <option value="Cat">Cats 🐱</option>
          <option value="Bird">Birds 🐦</option>
          <option value="Rabbit">🐰 Rabbit</option>
          <option value="Other">Other 🐾</option>
        </select>
      </div>

      {loading ? (
        <div className={styles.loadingState}>Loading your pets...</div>
      ) : (
        <>
          <div className={styles.cardGrid}>
            {filteredPets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                onClick={() => setSelectedPet(pet)}
                onDelete={onDelete}
                styles={styles}
              />
            ))}
          </div>

          {filteredPets.length === 0 && (
            <div className="text-center py-10 opacity-50">
              <p>No pets found matching your criteria</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const PetCard = ({ pet, onClick, onDelete, styles }) => {
  const age = pet.age ?? calculateAge(pet.dateOfBirth);
  const displayGender = formatGender(pet.gender);
  const speciesLabel = pet.species || 'Pet';

  return (
    <div className={styles.petCard} onClick={onClick} style={{ position: 'relative' }}>
      {onDelete && (
        <button
          onClick={(e) => onDelete(pet.id, e)}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '50%',
            padding: '8px',
            cursor: 'pointer',
            zIndex: 10,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          className="hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Delete Pet"
        >
          <FaTrash size={14} color="#dc2626" />
        </button>
      )}
      <div className="h-48 overflow-hidden bg-gray-200">
        {pet.photo ? (
          <img
            src={`http://localhost:8080${pet.photo}`}
            alt={pet.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl bg-pink-100">
            {speciesLabel.toLowerCase() === 'dog' ? '🐶' : '🐱'}
          </div>
        )}
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{pet.name}</h3>
        <p className={styles.cardText}>
          {pet.breed || speciesLabel}
          {age !== null ? ` • ${age} ${age === 1 ? 'year' : 'years'}` : ''}
        </p>
        <div className="mt-3 flex gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
            {displayGender}
          </span>
          {pet.healthStatus && (
            <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold">
              {pet.healthStatus}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const ComingSoonSection = ({ icon, title, styles }) => (
  <div className={styles.comingSoonBox}>
    <div className="text-8xl mb-4 animate-bounce">{icon}</div>
    <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--primary-color)' }}>
      {title}
    </h2>
    <p className="text-xl text-gray-500">Feature coming soon! 🚀</p>
  </div>
);

const ProfileSection = ({ user, navigate, styles }) => (
  <div className={styles.comingSoonBox}>
    <div className="text-8xl mb-4">👤</div>
    <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--primary-color)' }}>
      {user?.name || 'My Profile'}
    </h2>
    <p className="text-xl text-gray-600 mb-6">{user?.email}</p>

    <div className="flex gap-4 justify-center">
      <button
        onClick={() => navigate('/profile')}
        className={styles.primaryBtn}
      >
        Edit Profile
      </button>
      <button
        onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }}
        className={styles.secondaryBtn}
        style={{ borderColor: 'red', color: 'red' }}
      >
        Logout
      </button>
    </div>
  </div>
);

const PetDetailModal = ({ pet, onClose, styles }) => {
  const age = pet.age ?? calculateAge(pet.dateOfBirth);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-3xl font-bold" style={{ color: 'var(--primary-color)' }}>
            {pet.name} 💕
          </h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <FaTimes />
          </button>
        </div>
        <div className="h-64 rounded-xl overflow-hidden mb-6">
          <img
            src={pet.photo ? `http://localhost:8080${pet.photo}` : 'https://via.placeholder.com/400'}
            alt={pet.name}
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-xl text-center font-semibold text-gray-600">
          {(pet.breed || pet.species || 'Pet') +
            (age !== null ? ` • ${age} ${age === 1 ? 'year' : 'years'}` : '') +
            (pet.gender ? ` • ${formatGender(pet.gender)}` : '')}
        </p>
      </div>
    </div>
  );
};

// Health Section - Shows all medical records and vaccinations
const HealthSection = ({ pets, styles }) => {
  const [healthData, setHealthData] = React.useState({
    records: [],
    vaccinations: [],
    loading: true
  });

  React.useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const allRecords = [];
        const allVaccinations = [];

        for (const pet of pets) {
          const [records, vaccinations] = await Promise.all([
            medicalRecordService.getRecordsByPet(pet.id).catch(() => []),
            vaccinationService.getVaccinationsByPet(pet.id).catch(() => [])
          ]);

          allRecords.push(...records.map(r => ({ ...r, petName: pet.name, petId: pet.id })));
          allVaccinations.push(...vaccinations.map(v => ({ ...v, petName: pet.name, petId: pet.id })));
        }

        setHealthData({
          records: allRecords.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate)),
          vaccinations: allVaccinations.sort((a, b) => new Date(b.dateGiven) - new Date(a.dateGiven)),
          loading: false
        });
      } catch (error) {
        console.error('Failed to fetch health data:', error);
        setHealthData(prev => ({ ...prev, loading: false }));
      }
    };

    if (pets.length > 0) {
      fetchHealthData();
    } else {
      setHealthData({ records: [], vaccinations: [], loading: false });
    }
  }, [pets]);

  if (healthData.loading) {
    return <div className={styles.loadingState}>Loading health data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--primary-color)' }}>
          📊 Health Records
        </h2>
        <p className="text-gray-600">Complete medical history for all your pets</p>
      </div>

      {/* Medical Records */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--primary-color)' }}>
          🏥 Medical Records ({healthData.records.length})
        </h3>
        {healthData.records.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No medical records yet</p>
        ) : (
          <div className="space-y-3">
            {healthData.records.map((record, idx) => (
              <div key={idx} className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{record.recordType}</p>
                    <p className="text-sm text-gray-600">{record.petName}</p>
                    {record.diagnosis && <p className="text-sm text-gray-700 mt-1">{record.diagnosis}</p>}
                    {record.vetName && <p className="text-xs text-gray-500 mt-1">Dr. {record.vetName}</p>}
                  </div>
                  <span className="text-xs text-gray-400">{record.visitDate}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vaccinations */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--primary-color)' }}>
          💉 Vaccinations ({healthData.vaccinations.length})
        </h3>
        {healthData.vaccinations.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No vaccinations recorded yet</p>
        ) : (
          <div className="space-y-3">
            {healthData.vaccinations.map((vaccination, idx) => (
              <div key={idx} className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{vaccination.vaccineName}</p>
                    <p className="text-sm text-gray-600">{vaccination.petName}</p>
                    {vaccination.nextDueDate && (
                      <p className="text-xs text-gray-500 mt-1">Next due: {vaccination.nextDueDate}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{vaccination.dateGiven}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Reminders Section - Shows all reminders
const RemindersSection = ({ pets, styles }) => {
  const [reminders, setReminders] = React.useState({ upcoming: [], past: [], loading: true });

  React.useEffect(() => {
    const fetchReminders = async () => {
      try {
        const allReminders = [];
        for (const pet of pets) {
          const petReminders = await reminderService.getRemindersByPet(pet.id).catch(() => []);
          allReminders.push(...petReminders.map(r => ({ ...r, petName: pet.name, petId: pet.id })));
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = allReminders.filter(r => new Date(r.dueDate) >= today)
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        const past = allReminders.filter(r => new Date(r.dueDate) < today)
          .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));

        setReminders({ upcoming, past, loading: false });
      } catch (error) {
        console.error('Failed to fetch reminders:', error);
        setReminders({ upcoming: [], past: [], loading: false });
      }
    };

    if (pets.length > 0) {
      fetchReminders();
    } else {
      setReminders({ upcoming: [], past: [], loading: false });
    }
  }, [pets]);

  if (reminders.loading) {
    return <div className={styles.loadingState}>Loading reminders...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--primary-color)' }}>
          🔔 Reminders
        </h2>
        <p className="text-gray-600">Never miss important dates for your pets</p>
      </div>

      {/* Upcoming Reminders */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--primary-color)' }}>
          ⏰ Upcoming ({reminders.upcoming.length})
        </h3>
        {reminders.upcoming.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No upcoming reminders</p>
        ) : (
          <div className="space-y-3">
            {reminders.upcoming.map((reminder, idx) => (
              <div key={idx} className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{reminder.title || reminder.type}</p>
                    <p className="text-sm text-gray-600">{reminder.petName}</p>
                    {reminder.description && <p className="text-sm text-gray-700 mt-1">{reminder.description}</p>}
                  </div>
                  <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                    {reminder.dueDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Reminders */}
      {reminders.past.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-600">
            ✓ Past ({reminders.past.length})
          </h3>
          <div className="space-y-3">
            {reminders.past.slice(0, 5).map((reminder, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl opacity-75">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-600">{reminder.title || reminder.type}</p>
                    <p className="text-sm text-gray-500">{reminder.petName}</p>
                  </div>
                  <span className="text-xs text-gray-400">{reminder.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* eslint-disable no-unused-vars */
const AppointmentBookingModal = ({ pets, onClose, styles }) => {
  const [step, setStep] = React.useState(1);
  const [vets, setVets] = React.useState([]);
  const [selectedPetId, setSelectedPetId] = React.useState(pets[0]?.id || '');
  const [selectedVet, setSelectedVet] = React.useState(null);
  const [selectedDate, setSelectedDate] = React.useState(() => {
    // Default to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [slots, setSlots] = React.useState([]);
  const [selectedSlot, setSelectedSlot] = React.useState(null);
  const [reason, setReason] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // Get minimum date (today)
  const minDate = new Date().toISOString().split('T')[0];

  // Get maximum date (3 months from now)
  const maxDate = (() => {
    const max = new Date();
    max.setMonth(max.getMonth() + 3);
    return max.toISOString().split('T')[0];
  })();

  React.useEffect(() => {
    const loadVets = async () => {
      try {
        const data = await vetService.listAll();
        // Ensure data is always an array
        setVets(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to load vets:', e);
        // Set empty array on error
        setVets([]);
      }
    };
    loadVets();
  }, []);

  const handleVetSelect = async (vet) => {
    setSelectedVet(vet);
    setLoading(true);
    try {
      const data = await appointmentService.getAvailableSlots(vet.id);
      setSlots(data || []);
    } catch (e) { console.error(e); setSlots([]); }
    setLoading(false);
    setStep(2);
  };

  const handleBook = async () => {
    if (!selectedPetId) return alert("Select a pet");
    if (!selectedDate) return alert("Select a date");

    setLoading(true);
    try {
      // Combine selected date with slot time, or use default time if no slot
      let appointmentDateTime;
      if (selectedSlot && selectedSlot.startTime) {
        // Use the slot's time but with the selected date
        const slotTime = new Date(selectedSlot.startTime);
        const [year, month, day] = selectedDate.split('-');
        appointmentDateTime = new Date(year, month - 1, day, slotTime.getHours(), slotTime.getMinutes());
      } else {
        // Use selected date with default time (10:00 AM)
        const [year, month, day] = selectedDate.split('-');
        appointmentDateTime = new Date(year, month - 1, day, 10, 0, 0);
      }

      await appointmentService.bookAppointment({
        petId: selectedPetId,
        slotId: selectedSlot?.id,
        veterinarianId: selectedVet.id,
        dateTime: appointmentDateTime.toISOString(),
        type: selectedSlot?.supportedType === 'IN_CLINIC' ? 'IN_CLINIC' : 'VIDEO',
        reason
      });
      alert('Appointment Booked Successfully! Confirmation email sent.');
      onClose();
    } catch (e) {
      alert('Booking Failed: ' + (e.response?.data?.message || e.message));
    }
    setLoading(false);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold">Book Appointment</h2>
          <button onClick={onClose}><FaTimes /></button>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium">Select Pet</label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {pets.map(pet => (
                <div key={pet.id}
                  onClick={() => setSelectedPetId(pet.id)}
                  className={`p-3 border rounded-xl cursor-pointer min-w-[100px] text-center ${selectedPetId === pet.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
                  <div className="font-bold">{pet.name}</div>
                  <div className="text-xs text-gray-500">{pet.species}</div>
                </div>
              ))}
            </div>

            <label className="block text-sm font-medium">Select Veterinarian</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {vets.map(vet => (
                <div key={vet.id} onClick={() => handleVetSelect(vet)}
                  className="p-3 border rounded-xl hover:shadow-md cursor-pointer transition-all">
                  <div className="font-bold">{vet.clinicName}</div>
                  <div className="text-sm text-gray-600">{vet.name || vet.user?.name}</div>
                  <div className="text-xs text-blue-500">{vet.specialization}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <button onClick={() => setStep(1)} className="text-sm text-gray-500 mb-2">&larr; Back to Vets</button>
            <h3 className="font-bold text-lg">Book with {selectedVet?.clinicName}</h3>

            {/* Date Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={minDate}
                max={maxDate}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">You can book up to 3 months in advance</p>
            </div>

            {/* Time Slots */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ⏰ Select Time Slot
              </label>
              {loading ? <p>Loading slots...</p> : (
                <div className="grid grid-cols-3 gap-2">
                  {slots.length === 0 && <p className="col-span-3 text-gray-500">No slots available. (Using fallback booking)</p>}

                  {(slots.length > 0 ? slots : [
                    { id: null, startTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(), supportedType: 'VIDEO' }, // Mock
                  ]).map((slot, idx) => (
                    <div key={slot.id || idx}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2 border rounded text-center cursor-pointer ${selectedSlot === slot ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}>
                      {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <textarea
              placeholder="Reason for visit..."
              className="w-full border rounded-xl p-3 mt-4"
              value={reason} onChange={e => setReason(e.target.value)}
            />

            <button onClick={handleBook} disabled={loading} className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold mt-4 hover:bg-purple-700">
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Appointments Section - Calendar-like view
const AppointmentsSection = ({ pets, styles }) => {
  const [appointments, setAppointments] = React.useState({ upcoming: [], loading: true });
  const [showBooking, setShowBooking] = React.useState(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const fetchAppointments = React.useCallback(async () => {
    try {
      const allAppointments = [];

      for (const pet of pets) {
        // Fetch Real Appointments
        const realAppts = await appointmentService.getPetAppointments(pet.id).catch((err) => {
          console.error(`Error fetching appointments for pet ${pet.id}:`, err);
          return [];
        });

        if (realAppts && realAppts.length > 0) {
          allAppointments.push(...realAppts.map(a => ({
            type: 'appointment',
            title: 'Vet Visit: ' + (a.type === 'VIDEO' ? 'Teleconsult' : 'In-Clinic'),
            date: a.appointmentDate,
            petName: pet.name,
            petId: pet.id,
            status: a.status,
            meetingLink: a.meetingLink
          })));
        }

        // Fetch Vaccinations as well
        const vaccinations = await vaccinationService.getVaccinationsByPet(pet.id).catch(() => []);
        vaccinations.forEach(v => {
          if (v.nextDueDate) {
            allAppointments.push({
              type: 'vaccination',
              title: `${v.vaccineName} - Due`,
              date: v.nextDueDate,
              petName: pet.name,
              petId: pet.id
            });
          }
        });
      }

      // Set today to start of day for comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Filter upcoming appointments
      const upcoming = allAppointments.filter(a => {
        const appointmentDate = new Date(a.date);
        return appointmentDate >= today;
      }).sort((a, b) => new Date(a.date) - new Date(b.date));

      setAppointments({ upcoming, loading: false });
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      setAppointments({ upcoming: [], loading: false });
    }
  }, [pets]);

  React.useEffect(() => {
    if (pets.length > 0) {
      fetchAppointments();
    } else {
      setAppointments({ upcoming: [], loading: false });
    }
  }, [pets, refreshTrigger, fetchAppointments]);

  if (appointments.loading) {
    return <div className={styles.loadingState}>Loading appointments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--primary-color)' }}>
          📅 Appointments
        </h2>
        <p className="text-gray-600">Your upcoming pet care schedule</p>
        <button onClick={() => setShowBooking(true)} className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-full font-bold shadow hover:bg-purple-700 transition-all">
          + Book New Appointment
        </button>
      </div>

      {showBooking && <AppointmentBookingModal pets={pets} onClose={() => { setShowBooking(false); setRefreshTrigger(prev => prev + 1); }} styles={styles} />}

      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--primary-color)' }}>
          📆 Upcoming Appointments ({appointments.upcoming.length})
        </h3>
        {appointments.upcoming.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-6xl mb-4">📅</p>
            <h4 className="text-xl font-bold text-gray-700 mb-2">No Upcoming Appointments</h4>
            <p className="text-gray-500">All caught up! Your calendar is clear.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.upcoming.map((appointment, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border-l-4 ${appointment.type === 'vaccination'
                  ? 'bg-green-50 border-green-400'
                  : 'bg-blue-50 border-blue-400'
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">
                        {appointment.type === 'vaccination' ? '💉' : '🔔'}
                      </span>
                      <p className="font-bold text-gray-800">{appointment.title}</p>
                    </div>
                    <p className="text-sm text-gray-600 ml-7">{appointment.petName} ({new Date(appointment.date).toLocaleString()})</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mt-1">
                      {appointment.type === 'vaccination' ? 'Vaccination Due' : (appointment.status || 'Scheduled')}
                    </p>
                    {appointment.meetingLink && (
                      <a href={appointment.meetingLink} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline block mt-1 hover:text-blue-800">Join Video</a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
