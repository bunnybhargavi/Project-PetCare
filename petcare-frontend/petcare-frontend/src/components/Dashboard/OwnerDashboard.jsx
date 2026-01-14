import React, { useEffect, useMemo, useState } from 'react'; // Owner Dashboard Component
import {
  FaBell,
  FaCalendarAlt,
  FaChartLine,
  FaHeart,
  FaPlus,
  FaSearch,
  FaTimes,
  FaUser,
  FaTrash,
  FaShoppingCart,
  FaFilter,
  FaStar,
  FaTag,
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
import { productService } from '../../services/productService';
import { cartService } from '../../services/cartService';
import { orderService } from '../../services/orderService';
import CheckoutModal from '../Shop/CheckoutModal';
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
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
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
    console.log('=== Vet Selected ===');
    console.log('Vet:', vet);
    setSelectedVet(vet);
    setLoading(true);
    setSlots([]); // Clear previous slots
    try {
      console.log('Fetching slots for vet ID:', vet.id);
      const data = await appointmentService.getAvailableSlots(vet.id);
      console.log('Slots received from API:', data);
      
      // If vet has created slots, use them; otherwise use default slots
      if (data && data.length > 0) {
        console.log('Using vet-created slots:', data.length);
        setSlots(data);
      } else {
        console.log('No vet slots found, generating default slots');
        const defaultSlots = generateDefaultSlots();
        console.log('Generated default slots:', defaultSlots.length);
        setSlots(defaultSlots);
      }
    } catch (e) { 
      console.error('Error fetching slots:', e); 
      // On error, use default slots
      console.log('Error occurred, using default slots');
      const defaultSlots = generateDefaultSlots();
      console.log('Generated default slots after error:', defaultSlots.length);
      setSlots(defaultSlots);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
      setStep(2);
    }
  };

  // Generate default time slots (9 AM to 5 PM, every hour) for tomorrow
  const generateDefaultSlots = () => {
    const defaultSlots = [];
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // Start at 9 AM tomorrow

    for (let hour = 9; hour <= 17; hour++) {
      const slotTime = new Date(tomorrow);
      slotTime.setHours(hour);
      
      defaultSlots.push({
        id: `default-${hour}`,
        startTime: slotTime.toISOString(),
        endTime: new Date(slotTime.getTime() + 60 * 60 * 1000).toISOString(),
        mode: 'IN_CLINIC',
        capacity: 5,
        bookedCount: 0,
        status: 'AVAILABLE',
        isDefault: true // Flag to identify default slots
      });
    }

    return defaultSlots;
  };

  const handleBook = async () => {
    if (!selectedPetId) return alert("Please select a pet");
    if (!selectedDate) return alert("Please select a date");
    if (!selectedSlot) return alert("Please select a time slot");
    if (!selectedVet) return alert("Please select a veterinarian");
    
    // Validate reason if provided
    if (reason && reason.trim().length > 0 && reason.trim().length < 5) {
      return alert("Reason must be at least 5 characters long");
    }
    if (reason && reason.trim().length > 500) {
      return alert("Reason must not exceed 500 characters");
    }

    setLoading(true);
    try {
      // Combine selected date with slot time
      const slotTime = new Date(selectedSlot.startTime);
      const [year, month, day] = selectedDate.split('-');
      const appointmentDateTime = new Date(
        parseInt(year), 
        parseInt(month) - 1, 
        parseInt(day), 
        slotTime.getHours(), 
        slotTime.getMinutes(),
        0, 0
      );

      // Ensure the appointment type is set correctly
      const appointmentType = selectedSlot.mode === 'TELECONSULT' ? 'TELECONSULT' : 'IN_CLINIC';

      const appointmentData = {
        petId: parseInt(selectedPetId),
        veterinarianId: parseInt(selectedVet.id),
        type: appointmentType,
        dateTime: appointmentDateTime.toISOString()
      };
      
      // Only add slot ID if it's a real vet-created slot (not default)
      if (selectedSlot && !selectedSlot.isDefault && selectedSlot.id && typeof selectedSlot.id === 'number') {
        appointmentData.slotId = parseInt(selectedSlot.id);
      }
      
      // Add reason if provided and valid
      if (reason && reason.trim().length >= 5) {
        appointmentData.reason = reason.trim();
      }

      console.log('Booking appointment with data:', appointmentData);
      
      const response = await appointmentService.bookAppointment(appointmentData);
      console.log('Booking response:', response);
      
      alert('✅ Appointment Requested Successfully!\n\nStatus: PENDING\nPlease wait for veterinarian approval.');
      onClose();
    } catch (e) {
      console.error('Booking error:', e);
      console.error('Error response:', e.response?.data);
      const errorMessage = e.response?.data?.message || e.message || 'Unknown error occurred';
      alert('❌ Booking Failed:\n\n' + errorMessage + '\n\nPlease check all fields and try again.');
    } finally {
      setLoading(false);
    }
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

            {/* Date Picker in Step 1 */}
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

            <label className="block text-sm font-medium">Select Veterinarian</label>
            {vets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-4xl mb-2">👨‍⚕️</p>
                <p>No veterinarians available</p>
                <p className="text-xs mt-2">Please contact support</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {vets.map(vet => (
                  <div key={vet.id} onClick={() => handleVetSelect(vet)}
                    className="p-3 border rounded-xl hover:shadow-md cursor-pointer transition-all hover:border-purple-300">
                    <div className="font-bold">{vet.clinicName}</div>
                    <div className="text-sm text-gray-600">{vet.name || vet.user?.name}</div>
                    <div className="text-xs text-blue-500">{vet.specialization}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <button onClick={() => setStep(1)} className="text-sm text-gray-500 mb-2 hover:text-purple-600">&larr; Back to Selection</button>
            
            <div className="bg-purple-50 p-4 rounded-xl mb-4">
              <h3 className="font-bold text-lg text-purple-900">Booking Summary</h3>
              <div className="mt-2 space-y-1 text-sm">
                <p><span className="font-semibold">Clinic:</span> {selectedVet?.clinicName}</p>
                <p><span className="font-semibold">Doctor:</span> {selectedVet?.name || selectedVet?.user?.name}</p>
                <p><span className="font-semibold">Pet:</span> {pets.find(p => p.id === selectedPetId)?.name}</p>
                <p><span className="font-semibold">Date:</span> {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ⏰ Select Time Slot
              </label>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <p className="mt-2 text-gray-600">Loading available slots...</p>
                </div>
              ) : (
                <>
                  {slots.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <p className="text-4xl mb-2">📅</p>
                      <p className="text-gray-600">No slots available</p>
                    </div>
                  ) : (
                    <>
                      {/* Show info about slot types */}
                      {slots.some(s => s.isDefault) && slots.some(s => !s.isDefault) && (
                        <div className="mb-3 p-2 bg-blue-50 rounded-lg text-xs text-blue-700">
                          💡 Showing both vet-created slots and default time slots
                        </div>
                      )}
                      {slots.every(s => s.isDefault) && (
                        <div className="mb-3 p-2 bg-gray-50 rounded-lg text-xs text-gray-600">
                          📅 Default time slots (9 AM - 5 PM)
                        </div>
                      )}
                      
                      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                        {slots.map((slot, idx) => (
                          <div 
                            key={slot.id || idx}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-3 border-2 rounded-lg text-center cursor-pointer transition-all ${
                              selectedSlot === slot 
                                ? 'bg-purple-600 text-white border-purple-600 shadow-lg transform scale-105' 
                                : 'hover:bg-gray-50 border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            <div className="font-bold text-sm">
                              {new Date(slot.startTime).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </div>
                            <div className={`text-xs mt-1 ${selectedSlot === slot ? 'text-purple-100' : 'text-gray-500'}`}>
                              {slot.isDefault ? '📅 Default' : '👨‍⚕️ Vet Slot'}
                            </div>
                            {!slot.isDefault && slot.mode && (
                              <div className={`text-xs mt-1 ${selectedSlot === slot ? 'text-purple-100' : 'text-blue-600'}`}>
                                {slot.mode === 'TELECONSULT' ? '📹 Video' : '🏥 Clinic'}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Reason for visit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📝 Reason for Visit (Optional)
              </label>
              <textarea
                placeholder="Describe your pet's symptoms or reason for the visit (minimum 5 characters if provided)..."
                className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                rows="3"
                value={reason} 
                onChange={e => setReason(e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {reason.length}/500 characters {reason.length > 0 && reason.length < 5 && '(minimum 5 required)'}
              </p>
            </div>

            <button 
              onClick={handleBook} 
              disabled={loading || !selectedSlot} 
              className={`w-full py-3 rounded-xl font-bold mt-4 transition-all ${
                loading || !selectedSlot
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Booking...
                </span>
              ) : (
                '✅ Confirm Booking'
              )}
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
            title: 'Vet Visit: ' + (a.type === 'TELECONSULT' ? 'Teleconsult' : 'In-Clinic'),
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

// Shop Section - Pet product catalog similar to reference image
const ShopSection = ({ styles }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [productSource, setProductSource] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [cart, setCart] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories', emoji: '🌟' },
    { value: 'FOOD', label: 'Food & Treats', emoji: '🍖' },
    { value: 'TOYS', label: 'Toys', emoji: '🧸' },
    { value: 'HEALTH', label: 'Health & Wellness', emoji: '💊' },
    { value: 'GROOMING', label: 'Grooming', emoji: '🛁' },
    { value: 'ACCESSORIES', label: 'Accessories', emoji: '🎀' },
    { value: 'BEDS', label: 'Beds & Furniture', emoji: '🛏️' },
    { value: 'TRAINING', label: 'Training', emoji: '🎯' },
    { value: 'TRAVEL', label: 'Travel', emoji: '🧳' }
  ];

  const productSources = [
    { value: 'all', label: 'All Products', emoji: '🌟' },
    { value: 'vendor', label: 'Vendor Products', emoji: '🏪' },
    { value: 'admin', label: 'Store Products', emoji: '🏬' }
  ];

  const brands = ['all', 'Royal Canin', 'Pedigree', 'Farmina', 'Hill\'s', 'Purina', 'Whiskas'];

  // Load products and cart
  useEffect(() => {
    loadProducts();
    loadCart();
  }, []);

  // Filter products when filters change
  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, priceRange, selectedBrand, availability, productSource, sortBy]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading products from API...');
      const response = await productService.getAllProducts(0, 500);
      console.log('📦 Raw API response:', response);
      const productList = response.content || [];
      console.log('📋 Product list:', productList);
      console.log('🏪 Vendor products found:', productList.filter(p => p.vendorId !== null));
      console.log('🏬 Admin products found:', productList.filter(p => p.vendorId === null));
      // Show all products from vendors and admin
      setProducts(productList);
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    try {
      const response = await cartService.getCart();
      setCart(response.data);
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];
    console.log('🔍 Starting filter with products:', products.length);
    console.log('🎯 Current filters:', { searchTerm, selectedCategory, selectedBrand, priceRange, availability, productSource, sortBy });

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search) ||
        product.brand?.toLowerCase().includes(search)
      );
      console.log('🔍 After search filter:', filtered.length);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
      console.log('📂 After category filter:', filtered.length);
    }

    // Brand filter
    if (selectedBrand !== 'all') {
      filtered = filtered.filter(product => product.brand === selectedBrand);
      console.log('🏷️ After brand filter:', filtered.length);
    }

    // Price range filter
    filtered = filtered.filter(product => {
      const price = product.discountedPrice || product.price;
      return price >= priceRange.min && price <= priceRange.max;
    });
    console.log('💰 After price filter:', filtered.length);

    // Availability filter
    if (availability === 'in-stock') {
      filtered = filtered.filter(product => product.inStock);
      console.log('📦 After availability filter (in-stock):', filtered.length);
    } else if (availability === 'out-of-stock') {
      filtered = filtered.filter(product => !product.inStock);
      console.log('📦 After availability filter (out-of-stock):', filtered.length);
    }

    // Product source filter
    if (productSource === 'vendor') {
      filtered = filtered.filter(product => product.vendorId !== null);
      console.log('🏪 After vendor filter:', filtered.length);
    } else if (productSource === 'admin') {
      filtered = filtered.filter(product => product.vendorId === null);
      console.log('🏬 After admin filter:', filtered.length);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.discountedPrice || a.price) - (b.discountedPrice || b.price);
        case 'price-high':
          return (b.discountedPrice || b.price) - (a.discountedPrice || a.price);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'discount':
          return (b.discountPercentage || 0) - (a.discountPercentage || 0);
        default:
          return a.title.localeCompare(b.title);
      }
    });

    console.log('✅ Final filtered products:', filtered.length);
    console.log('🏪 Vendor products in final list:', filtered.filter(p => p.vendorId !== null));
    setFilteredProducts(filtered);
  };

  const handleAddToCart = async (productId) => {
    try {
      await cartService.addToCart(productId, 1);
      await loadCart();
      alert('Product added to cart! 🐾');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add product to cart');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange({ min: 0, max: 10000 });
    setSelectedBrand('all');
    setAvailability('all');
    setProductSource('all');
    setSortBy('name');
  };

  return (
    <div className="pet-shop-dashboard">
      {/* Header */}
      <div className="pet-shop-header-dashboard">
        <div className="title-section">
          <h2 className="pet-shop-title-dashboard">
            <span className="paw-icon">🐾</span>
            Pet Paradise Shop
            <span className="paw-icon">🐾</span>
          </h2>
          <p className="pet-shop-subtitle-dashboard">Everything your furry friends need! 💕</p>
          {cart && cart.totalItems > 0 && (
            <div className="cart-summary-dashboard">
              <span className="cart-info">
                <FaShoppingCart />
                {cart.totalItems} items in cart - ₹{cart.totalAmount?.toFixed(2)}
              </span>
              <button
                onClick={() => setShowCheckout(true)}
                className="pet-btn-primary"
                style={{
                  marginLeft: '15px',
                  padding: '8px 20px',
                  fontSize: '0.9rem',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Checkout 🐾
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="pet-shop-main-dashboard">
        {/* Left Sidebar with Filters */}
        <div className="pet-filters-sidebar-dashboard">
          <div className="sidebar-header">
            <h3 className="filter-title">
              <span className="bone-icon">🦴</span>
              Filter & Find
            </h3>
          </div>

          {/* Search Section */}
          <div className="filter-section">
            <div className="section-divider">
              <span className="paw-divider">🐾</span>
            </div>
            <h4 className="section-title">Search Products</h4>
            <div className="pet-search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search for treats, toys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pet-search-input"
              />
              {searchTerm && (
                <button
                  className="clear-search pet-button"
                  onClick={() => setSearchTerm('')}
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {/* Categories Section */}
          <div className="filter-section">
            <div className="section-divider">
              <span className="bone-divider">🦴</span>
            </div>
            <h4 className="section-title">Pet Categories</h4>
            <div className="category-buttons">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  className={`category-btn ${selectedCategory === cat.value ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.value)}
                >
                  <span className="category-icon">{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Source Section */}
          <div className="filter-section">
            <div className="section-divider">
              <span className="paw-divider">🐾</span>
            </div>
            <h4 className="section-title">Product Source</h4>
            <div className="category-buttons">
              {productSources.map(source => (
                <button
                  key={source.value}
                  className={`category-btn ${productSource === source.value ? 'active' : ''}`}
                  onClick={() => setProductSource(source.value)}
                >
                  <span className="category-icon">{source.emoji}</span>
                  {source.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Section */}
          <div className="filter-section">
            <div className="section-divider">
              <span className="paw-divider">🐾</span>
            </div>
            <h4 className="section-title">Price Range</h4>
            <div className="pet-price-range">
              <div className="price-display">
                <span className="price-tag">💰 ₹{priceRange.min} - ₹{priceRange.max}</span>
              </div>
              <div className="price-sliders">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                  className="pet-price-slider min-slider"
                />
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                  className="pet-price-slider max-slider"
                />
              </div>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="filter-section">
            <div className="section-divider">
              <span className="bone-divider">🦴</span>
            </div>
            <h4 className="section-title">Quick Filters</h4>
            <div className="quick-filter-pills">
              <button
                className={`filter-pill ${availability === 'in-stock' ? 'active stock' : ''}`}
                onClick={() => setAvailability(availability === 'in-stock' ? 'all' : 'in-stock')}
              >
                <span className="pill-icon">✅</span>
                In Stock Only
              </button>
              <button
                className={`filter-pill ${sortBy === 'discount' ? 'active sale' : ''}`}
                onClick={() => setSortBy(sortBy === 'discount' ? 'name' : 'discount')}
              >
                <span className="pill-icon">🏷️</span>
                On Sale
              </button>
              <button
                className={`filter-pill ${sortBy === 'rating' ? 'active rating' : ''}`}
                onClick={() => setSortBy(sortBy === 'rating' ? 'name' : 'rating')}
              >
                <span className="pill-icon">⭐</span>
                Top Rated
              </button>
            </div>
          </div>

          {/* Clear All Filters */}
          {(searchTerm || selectedCategory !== 'all' || selectedBrand !== 'all' || availability !== 'all' || productSource !== 'all') && (
            <div className="filter-section">
              <button
                className="clear-all-filters"
                onClick={clearFilters}
              >
                <FaTimes />
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="pet-shop-content-dashboard">
          {/* Top Controls */}
          <div className="content-header">
            <div className="results-info">
              <h3 className="results-title">
                <span className="bone-icon">🦴</span>
                {filteredProducts.length} Pawsome Products
                {searchTerm && <span className="search-term"> for "{searchTerm}"</span>}
              </h3>
            </div>

            <div className="content-controls">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pet-sort-select"
              >
                <option value="name">🔤 Name A-Z</option>
                <option value="price-low">💰 Price: Low to High</option>
                <option value="price-high">💰 Price: High to Low</option>
                <option value="rating">⭐ Highest Rated</option>
                <option value="discount">🏷️ Best Deals</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="pet-products-section">
            {loading ? (
              <div className="pet-loading">
                <div className="loading-animation">
                  <div className="bouncing-paws">
                    <span className="paw">🐾</span>
                    <span className="paw">🐾</span>
                    <span className="paw">🐾</span>
                  </div>
                  <p>Finding pawsome products...</p>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="pet-empty-state">
                <div className="empty-animation">
                  <span className="sad-pet">🐕‍🦺</span>
                  <div className="empty-paws">
                    <span>🐾</span>
                    <span>🐾</span>
                    <span>🐾</span>
                  </div>
                </div>
                <h4>No products found</h4>
                <p>Try adjusting your search or filters to find what you're looking for!</p>
                <button className="reset-filters-btn" onClick={clearFilters}>
                  <span className="btn-icon">🔄</span>
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="pet-products-grid-dashboard">
                {filteredProducts.map(product => (
                  <DashboardProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    styles={styles}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal
          cart={cart}
          onClose={() => setShowCheckout(false)}
          onOrderComplete={() => {
            setShowCheckout(false);
            loadCart();
            alert('Order placed successfully! 🐾');
          }}
          onCartUpdate={loadCart}
        />
      )}
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, onAddToCart, styles }) => {
  const discountedPrice = product.discountedPrice || product.price;
  const hasDiscount = product.discountPercentage > 0;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-purple-300 transition-all duration-300 transform hover:scale-105">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-100">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:8080${product.images[0]}`}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            📦
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            -{product.discountPercentage}% OFF
          </div>
        )}

        {/* Stock Status */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
          {product.inStock ? '✅ In Stock' : '❌ Out of Stock'}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        <div className="text-xs text-purple-600 font-semibold mb-1">
          {product.categoryDisplayName || product.category}
        </div>

        {/* Title */}
        <h4 className="font-bold text-gray-800 mb-2 line-clamp-2 h-12">
          {product.title}
        </h4>

        {/* Brand */}
        {product.brand && (
          <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
        )}

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}
                  size={12}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">({product.rating})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-purple-600">
            ₹{discountedPrice?.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-500 line-through">
              ₹{product.price?.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(product.id)}
          disabled={!product.inStock}
          className={`w-full py-2 px-4 rounded-xl font-semibold transition-colors ${product.inStock
            ? 'bg-purple-600 text-white hover:bg-purple-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          {product.inStock ? (
            <>
              <FaShoppingCart className="inline mr-2" />
              Add to Cart
            </>
          ) : (
            'Out of Stock'
          )}
        </button>
      </div>
    </div>
  );
};

// Dashboard Product Card Component with Pet Theme
const DashboardProductCard = ({ product, onAddToCart, styles }) => {
  const discountedPrice = product.discountedPrice || product.price;
  const hasDiscount = product.discountPercentage > 0;
  const rating = product.rating || 0;
  const isVendorProduct = product.vendorId !== null;

  const renderPawRating = (rating) => {
    const paws = [];
    const fullPaws = Math.floor(rating);
    const hasHalfPaw = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullPaws) {
        paws.push(<span key={i} className="paw-rating full">🐾</span>);
      } else if (i === fullPaws && hasHalfPaw) {
        paws.push(<span key={i} className="paw-rating half">🐾</span>);
      } else {
        paws.push(<span key={i} className="paw-rating empty">🐾</span>);
      }
    }
    return paws;
  };

  const handleVendorClick = () => {
    if (isVendorProduct) {
      // You can navigate to vendor profile or show vendor details
      alert(`Visit ${product.vendorBusinessName || product.vendorName}'s Store! 🏪`);
    }
  };

  return (
    <div className="pet-product-card-dashboard">
      {/* Product Image */}
      <div className="pet-product-image-dashboard">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:8080${product.images[0]}`}
            alt={product.title}
            className="product-img"
          />
        ) : (
          <div className="no-image-placeholder">
            <span className="placeholder-icon">📦</span>
            <span className="placeholder-text">No Image</span>
          </div>
        )}

        {/* Vendor Badge */}
        {isVendorProduct && (
          <div className="vendor-badge-dashboard">
            <span className="vendor-icon">🏪</span>
            <span className="vendor-text">Vendor</span>
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="pet-discount-badge-dashboard">
            <span className="discount-icon">🏷️</span>
            <span className="discount-text">{product.discountPercentage}% OFF</span>
          </div>
        )}

        {/* Stock Status */}
        <div className={`pet-stock-badge-dashboard ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
          <span className="stock-icon">{product.inStock ? '✅' : '❌'}</span>
        </div>
      </div>

      {/* Product Info */}
      <div className="pet-product-info-dashboard">
        {/* Category */}
        <div className="pet-product-category-dashboard">
          <span className="category-icon">
            {product.category === 'FOOD' && '🍖'}
            {product.category === 'TOYS' && '🧸'}
            {product.category === 'HEALTH' && '💊'}
            {product.category === 'GROOMING' && '🛁'}
            {product.category === 'ACCESSORIES' && '🎀'}
            {product.category === 'BEDS' && '🛏️'}
            {product.category === 'TRAINING' && '🎯'}
            {product.category === 'TRAVEL' && '🧳'}
            {!['FOOD', 'TOYS', 'HEALTH', 'GROOMING', 'ACCESSORIES', 'BEDS', 'TRAINING', 'TRAVEL'].includes(product.category) && '🐾'}
          </span>
          <span className="category-text">{product.categoryDisplayName || product.category}</span>
        </div>

        {/* Title */}
        <h4 className="pet-product-title-dashboard">{product.title}</h4>

        {/* Vendor Info */}
        {isVendorProduct && (
          <div className="pet-product-vendor-dashboard">
            <span className="vendor-label">Sold by:</span>
            <button
              onClick={handleVendorClick}
              className="vendor-link-dashboard"
            >
              <span className="vendor-shop-icon">🏪</span>
              <span className="vendor-name">{product.vendorBusinessName || product.vendorName}</span>
              <span className="visit-icon">→</span>
            </button>
          </div>
        )}

        {/* Brand */}
        {product.brand && (
          <p className="pet-product-brand-dashboard">
            <span className="brand-icon">🏷️</span>
            {product.brand}
          </p>
        )}

        {/* Rating */}
        {rating > 0 && (
          <div className="pet-product-rating-dashboard">
            <div className="paw-rating-container">
              {renderPawRating(rating)}
            </div>
            <span className="rating-text">({rating.toFixed(1)})</span>
          </div>
        )}

        {/* Price */}
        <div className="pet-product-price-dashboard">
          <span className="current-price">₹{discountedPrice?.toFixed(2)}</span>
          {hasDiscount && (
            <span className="original-price">₹{product.price?.toFixed(2)}</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(product.id)}
          disabled={!product.inStock}
          className={`pet-add-to-cart-dashboard ${!product.inStock ? 'disabled' : ''}`}
        >
          {product.inStock ? (
            <>
              <FaShoppingCart />
              <span>Add to Cart</span>
              <span className="paw-accent">🐾</span>
            </>
          ) : (
            <>
              <span className="sad-paw">🐾</span>
              <span>Out of Stock</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Orders Section Component
const OrdersSection = ({ styles }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Import orderService locally to avoid ESLint issues
        const { orderService } = await import('../../services/orderService');
        // Get user orders from orderService
        const response = await orderService.getUserOrders(user.id);
        if (response.success) {
          // Handle paginated response
          const ordersData = response.data?.content || response.data || [];
          setOrders(ordersData);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchOrders();
    }
  }, [user]);

  const getStatusConfig = (status) => {
    const statusConfigs = {
      'PENDING': {
        bg: '#FEF3C7',
        text: '#92400E',
        border: '#F59E0B',
        label: 'Pending',
        icon: '⏳'
      },
      'CONFIRMED': {
        bg: '#DBEAFE',
        text: '#1E40AF',
        border: '#3B82F6',
        label: 'Confirmed',
        icon: '✅'
      },
      'PROCESSING': {
        bg: '#FED7AA',
        text: '#C2410C',
        border: '#F97316',
        label: 'Processing',
        icon: '⚙️'
      },
      'SHIPPED': {
        bg: '#E0E7FF',
        text: '#3730A3',
        border: '#6366F1',
        label: 'Shipped',
        icon: '🚚'
      },
      'DELIVERED': {
        bg: '#D1FAE5',
        text: '#065F46',
        border: '#10B981',
        label: 'Delivered',
        icon: '📦'
      },
      'CANCELLED': {
        bg: '#FEE2E2',
        text: '#991B1B',
        border: '#EF4444',
        label: 'Cancelled',
        icon: '❌'
      }
    };

    return statusConfigs[status] || statusConfigs['PENDING'];
  };

  const getStatusBadge = (status) => {
    const config = getStatusConfig(status);
    return (
      <span
        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold space-x-1"
        style={{
          backgroundColor: config.bg,
          color: config.text
        }}
      >
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    );
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const filterOptions = [
    { value: 'all', label: 'All Orders', icon: '📋' },
    { value: 'PENDING', label: 'Pending', icon: '⏳' },
    { value: 'CONFIRMED', label: 'Confirmed', icon: '✅' },
    { value: 'PROCESSING', label: 'Processing', icon: '⚙️' },
    { value: 'SHIPPED', label: 'Shipped', icon: '🚚' },
    { value: 'DELIVERED', label: 'Delivered', icon: '📦' },
    { value: 'CANCELLED', label: 'Cancelled', icon: '❌' }
  ];

  if (loading) {
    return (
      <div className={styles.sectionContainer}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-purple-600">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sectionContainer}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-purple-600 mb-2">
            📦 My Orders
          </h2>
          <p className="text-gray-600 text-lg">Track your orders and delivery status</p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-2 ${filter === option.value
                ? 'text-white shadow-lg'
                : 'text-gray-600 bg-white border border-gray-200 hover:border-gray-300'
                }`}
              style={{
                background: filter === option.value
                  ? 'linear-gradient(135deg, #7C3F8C 0%, #E91E63 100%)'
                  : 'white',
                boxShadow: filter === option.value
                  ? '0 4px 16px rgba(124, 63, 140, 0.3)'
                  : '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}
            >
              <span>{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center relative overflow-hidden">
          <div className="text-9xl mb-6 animate-bounce">📦</div>
          <h3 className="text-3xl font-bold mb-4 text-purple-600">No orders found</h3>
          <p className="text-gray-600 text-lg max-w-md mx-auto">
            {filter === 'all'
              ? 'You haven\'t placed any orders yet. Start shopping to see your orders here!'
              : `No orders with status "${filterOptions.find(f => f.value === filter)?.label}" found`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-lg border-l-4 overflow-hidden transition-all duration-200 hover:shadow-xl"
                style={{
                  borderLeftColor: statusConfig.border,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                }}
              >
                <div className="p-8">
                  {/* Order Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
                        style={{ background: 'linear-gradient(135deg, #7C3F8C 0%, #E91E63 100%)' }}
                      >
                        📦
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">#{order.orderNumber}</h3>
                        <p className="text-sm text-gray-500">
                          Ordered on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="text-right">
                        <p className="text-3xl font-bold text-purple-600">
                          ₹{order.totalAmount?.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">Total Amount</p>
                      </div>
                      <div>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-gray-100 pt-6 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <span>📦</span>
                      <span>Order Items:</span>
                    </h4>
                    <div className="space-y-3">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                              <span className="text-xl">📦</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{item.product?.title || 'Product'}</p>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 text-lg">₹{item.totalPrice?.toFixed(2)}</p>
                            <p className="text-sm text-gray-600">₹{item.unitPrice?.toFixed(2)} each</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Information */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between pt-6 border-t border-gray-100 gap-4">
                    <div className="flex items-center space-x-3 text-gray-600">
                      <span className="text-xl">🚚</span>
                      <span className="font-medium">Shipping to:</span>
                      <span>{order.shippingAddress}, {order.shippingCity}</span>
                    </div>

                    <div className="flex items-center space-x-3 text-gray-600">
                      <span className="text-xl">💳</span>
                      <span className="font-medium">Payment:</span>
                      <span
                        className="px-3 py-1 rounded-full text-sm font-semibold"
                        style={{
                          backgroundColor: order.paymentStatus === 'PAID' ? '#D1FAE5' : '#FEE2E2',
                          color: order.paymentStatus === 'PAID' ? '#065F46' : '#991B1B'
                        }}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
