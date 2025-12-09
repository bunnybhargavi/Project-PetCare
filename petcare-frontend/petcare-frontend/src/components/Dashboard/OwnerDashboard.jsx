import React, { useState, useEffect } from 'react';
import { 
  FaHeart, FaPlus, FaCalendarAlt, FaChartLine, FaBell, 
  FaShoppingCart, FaUser, FaSearch, FaTimes 
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Import the CSS Module
import styles from './OwnerDashboard.module.css';

// Mock Data
const mockPets = [
  { id: 1, name: 'Max', species: 'Dog', breed: 'Golden Retriever', age: 3, gender: 'Male', weight: 30, imageUrl: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400' },
  { id: 2, name: 'Luna', species: 'Cat', breed: 'Persian', age: 2, gender: 'Female', weight: 4.5, imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400' },
];

const OwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [pets, setPets] = useState(mockPets);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const carouselImages = [
    'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1200',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1200',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { emoji: '🐾', label: 'My Pets', value: pets.length, color: '#FFB3D9' },
    { emoji: '📅', label: 'Appointments', value: '3', color: '#C3E5FF' },
    { emoji: '💉', label: 'Vaccinations', value: '1', color: '#D5F4E6' },
    { emoji: '🔔', label: 'Reminders', value: '5', color: '#FFF9C4' },
  ];

  const menuItems = [
    { id: 'overview', icon: FaHeart, label: 'Overview', emoji: '🏠' },
    { id: 'pets', icon: FaHeart, label: 'My Pets', emoji: '🐾' },
    { id: 'appointments', icon: FaCalendarAlt, label: 'Appointments', emoji: '📅' },
    { id: 'health', icon: FaChartLine, label: 'Health', emoji: '📊' },
    { id: 'reminders', icon: FaBell, label: 'Reminders', emoji: '🔔' },
    { id: 'marketplace', icon: FaShoppingCart, label: 'Shop', emoji: '🛒' },
    { id: 'profile', icon: FaUser, label: 'Profile', emoji: '👤' },
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
        <div className={styles.floatingPaw} style={{ top: '10%', right: '10%' }}>🐾</div>
        <div className={styles.floatingPaw} style={{ bottom: '20%', left: '5%', animationDelay: '2s' }}>✨</div>
        
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Welcome, {user?.name || 'Pet Parent'}! 🐾
          </h1>
          <p className={styles.heroSubtitle}>
            Where every tail wag and purr matters! 💕
          </p>
          
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
        {/* Quick Stats Grid */}
        <div className={styles.statsGrid}>
          {stats.map((stat, idx) => (
            <div key={idx} className={styles.statCard} style={{ borderBottom: `4px solid ${stat.color}` }}>
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
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`${styles.navItem} ${activeSection === item.id ? styles.navItemActive : ''}`}
              >
                <Icon />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Dynamic Content Sections */}
        <div className="animate-fade-in">
            {activeSection === 'overview' && <OverviewSection pets={pets} styles={styles} />}
            {activeSection === 'pets' && <PetsSection pets={pets} setPets={setPets} setSelectedPet={setSelectedPet} setShowAddPetModal={setShowAddPetModal} styles={styles} />}
            {activeSection === 'appointments' && <ComingSoonSection icon="📅" title="Appointments" styles={styles} />}
            {activeSection === 'health' && <ComingSoonSection icon="📊" title="Health Records" styles={styles} />}
            {activeSection === 'reminders' && <ComingSoonSection icon="🔔" title="Reminders" styles={styles} />}
            {activeSection === 'marketplace' && <ComingSoonSection icon="🛒" title="Marketplace" styles={styles} />}
            {activeSection === 'profile' && <ProfileSection navigate={navigate} styles={styles} />}
        </div>
      </div>

      {/* Modals */}
      {showAddPetModal && (
        <AddPetModal 
            onClose={() => setShowAddPetModal(false)} 
            onAdd={(pet) => setPets([...pets, { ...pet, id: Date.now() }])} 
            styles={styles} 
        />
      )}

      {selectedPet && (
        <PetDetailModal 
            pet={selectedPet} 
            onClose={() => setSelectedPet(null)} 
            styles={styles} 
        />
      )}
    </div>
  );
};

// --- Sub Components ---

const OverviewSection = ({ pets, styles }) => {
  const features = [
    { icon: FaHeart, title: 'My Pets', description: 'Manage your pet profiles', emoji: '🐕' },
    { icon: FaCalendarAlt, title: 'Appointments', description: 'Schedule vet visits', emoji: '📅' },
    { icon: FaShoppingCart, title: 'Marketplace', description: 'Shop pet essentials', emoji: '🛒' },
    { icon: FaChartLine, title: 'Health Records', description: 'Track medical history', emoji: '📊' },
    { icon: FaBell, title: 'Reminders', description: 'Never miss important dates', emoji: '🔔' },
    { icon: FaUser, title: 'My Profile', description: 'Update your information', emoji: '👤' },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold" style={{ color: 'var(--primary-color)' }}>Dashboard Overview 🌟</h2>
      </div>

      <div className={styles.cardGrid}>
        {features.map((feature, idx) => (
          <div key={idx} className={styles.featureCard}>
            <div className={styles.cardContent}>
                <div className="flex items-center mb-3">
                    <span className="text-3xl mr-3">{feature.emoji}</span>
                    <h3 className={styles.cardTitle}>{feature.title}</h3>
                </div>
                <p className={styles.cardText}>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-2xl font-bold mt-8 mb-4" style={{ color: 'var(--primary-color)' }}>Your Adorable Companions 🐾</h3>
      <div className={styles.cardGrid}>
        {pets.map((pet) => (
          <PetCard key={pet.id} pet={pet} styles={styles} />
        ))}
      </div>
    </div>
  );
};

const PetsSection = ({ pets, setPets, setSelectedPet, setShowAddPetModal, styles }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('all');

  const filteredPets = pets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSpecies === 'all' || pet.species === filterSpecies;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className="text-3xl font-bold" style={{ color: 'var(--primary-color)' }}>My Pets 🐾</h2>
        </div>
        <button onClick={() => setShowAddPetModal(true)} className={styles.primaryBtn}>
          <FaPlus /> Add Pet
        </button>
      </div>

      <div className="flex gap-4 mb-6 flex-wrap md:flex-nowrap">
        <div className={styles.searchContainer}>
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-300" />
          <input
            type="text"
            placeholder="Search pets... 🔍"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${styles.searchInput} pl-12`}
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

      <div className={styles.cardGrid}>
        {filteredPets.map((pet) => (
          <PetCard key={pet.id} pet={pet} onClick={() => setSelectedPet(pet)} styles={styles} />
        ))}
      </div>
      
      {filteredPets.length === 0 && (
          <div className="text-center py-10 opacity-50">
              <p>No pets found matching your criteria</p>
          </div>
      )}
    </div>
  );
};

const PetCard = ({ pet, onClick, styles }) => (
  <div className={styles.petCard} onClick={onClick}>
    <div className="h-48 overflow-hidden bg-gray-200">
      {pet.imageUrl ? (
        <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-6xl bg-pink-100">
          {pet.species === 'Dog' ? '🐶' : '🐱'}
        </div>
      )}
    </div>
    <div className={styles.cardContent}>
      <h3 className={styles.cardTitle}>{pet.name}</h3>
      <p className={styles.cardText}>{pet.breed} • {pet.age} years</p>
      <div className="mt-3 flex gap-2">
         <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
            {pet.gender === 'Male' ? '♂️ Male' : '♀️ Female'}
         </span>
      </div>
    </div>
  </div>
);

const ComingSoonSection = ({ icon, title, styles }) => (
  <div className={styles.comingSoonBox}>
    <div className="text-8xl mb-4 animate-bounce">{icon}</div>
    <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--primary-color)' }}>{title}</h2>
    <p className="text-xl text-gray-500">Feature coming soon! 🚀</p>
  </div>
);

const ProfileSection = ({ navigate, styles }) => (
  <div className={styles.comingSoonBox}>
    <div className="text-8xl mb-4">👤</div>
    <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--primary-color)' }}>My Profile</h2>
    <button onClick={() => navigate('/profile')} className={styles.primaryBtn} style={{margin: '20px auto'}}>
      Go to Profile Page
    </button>
  </div>
);

const AddPetModal = ({ onClose, onAdd, styles }) => {
  const [formData, setFormData] = useState({ name: '', species: 'Dog', breed: '', age: '', gender: 'Male', weight: '', imageUrl: '' });

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>Add New Pet 🐾</h2>
          <button onClick={onClose} className={styles.closeBtn}><FaTimes /></button>
        </div>
        <div className="space-y-4">
          <input type="text" placeholder="Pet Name" className={styles.searchInput} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <select className={styles.selectInput} value={formData.species} onChange={(e) => setFormData({ ...formData, species: e.target.value })}>
            <option value="Dog">🐶 Dog</option>
            <option value="Cat">🐱 Cat</option>
            <option value="Bird">🐦 Bird</option>
          </select>
          <input type="text" placeholder="Breed" className={styles.searchInput} value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} />
          <div className="flex gap-4">
             <input type="number" placeholder="Age" className={styles.searchInput} value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
             <input type="number" placeholder="Weight (kg)" className={styles.searchInput} value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} />
          </div>
          <button onClick={() => { onAdd(formData); onClose(); }} className={styles.primaryBtn} style={{ width: '100%', justifyContent: 'center' }}>Save Pet</button>
        </div>
      </div>
    </div>
  );
};

const PetDetailModal = ({ pet, onClose, styles }) => (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContent}>
      <div className="flex justify-between items-start mb-4">
          <h2 className="text-3xl font-bold" style={{ color: 'var(--primary-color)' }}>{pet.name} 💕</h2>
          <button onClick={onClose} className={styles.closeBtn}><FaTimes /></button>
      </div>
      <div className="h-64 rounded-xl overflow-hidden mb-6">
         <img src={pet.imageUrl || 'https://via.placeholder.com/400'} alt={pet.name} className="w-full h-full object-cover" />
      </div>
      <p className="text-xl text-center font-semibold text-gray-600">
        {pet.breed} • {pet.age} years • {pet.gender}
      </p>
    </div>
  </div>
);

export default OwnerDashboard;