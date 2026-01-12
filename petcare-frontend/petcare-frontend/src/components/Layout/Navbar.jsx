import { FaHome, FaPaw } from 'react-icons/fa';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Helper function to fetch image as blob with authentication
const fetchImageAsBlob = async (relativePath) => {
  if (!relativePath) return null;
  if (relativePath.startsWith('http') && !relativePath.includes('localhost:8080')) {
    return relativePath;
  }

  try {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
    const BASE_URL = API_URL.replace('/api', '');
    const token = sessionStorage.getItem('token');

    if (!token) return null;

    let imageUrl;
    if (relativePath.startsWith('/uploads/profiles/')) {
      imageUrl = `${BASE_URL}${relativePath}`;
    } else if (relativePath.startsWith('/uploads/')) {
      imageUrl = `${BASE_URL}${relativePath}`;
    } else {
      imageUrl = `${BASE_URL}/uploads/profiles/${relativePath.replace(/^\/+/, '')}`;
    }

    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (response.ok) {
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }
    return null;
  } catch (error) {
    console.error('Error fetching image as blob:', error);
    return null;
  }
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);

  // ... existing useEffect ...

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Logo and Brand */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 group"
            >
              {/* Composed Logo: House with Paw */}
              <div className="relative flex items-center justify-center w-10 h-10">
                <FaHome className="text-teal-500 text-4xl" />
                <div className="absolute inset-0 flex items-center justify-center pt-1">
                  <FaPaw className="text-white text-lg" />
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-900 tracking-tight group-hover:text-blue-700 transition-colors">
                PawHaven
              </span>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">

            {/* Dashboard Link */}
            <button
              onClick={() => navigate('/dashboard')}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              Dashboard
            </button>

            {/* Pets Link - Only show for non-VET users */}
            {user?.role !== 'VET' && (
              <button
                onClick={() => navigate('/pets')}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                Pets
              </button>
            )}

            {/* Patients Link - Only show for VET users */}
            {user?.role === 'VET' && (
              <button
                onClick={() => navigate('/patients')}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                Patients
              </button>
            )}

            {user?.role !== 'VET' && (
              <button
                onClick={() => navigate('/find-vet')}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                Find a Vet
              </button>
            )}




            {/* My Orders Link */}
            {user?.role !== 'VET' && (
              <button
                onClick={() => navigate('/orders')}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                My Orders
              </button>
            )}

            {/* Shop Link - Only show for non-VET users */}
            {user?.role !== 'VET' && (
              <button
                onClick={() => navigate('/shop')}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                🛒 Shop
              </button>
            )}

            {/* Profile Link */}
            <button
              onClick={() => navigate('/profile')}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              Profile
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {profilePhotoUrl ? (
                  <img
                    src={profilePhotoUrl}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.nextElementSibling;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold ${profilePhotoUrl ? 'hidden' : ''}`}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block">{user?.name}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${user?.role === 'VET'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                      }`}>
                      {user?.role === 'VET' ? '🩺 Veterinarian' : '🐕 Pet Owner'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      navigate('/profile');
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    👤 My Profile
                  </button>

                  <button
                    onClick={() => {
                      navigate('/dashboard');
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    📊 Dashboard
                  </button>

                  {user?.role !== 'VET' && (
                    <button
                      onClick={() => {
                        navigate('/pets');
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      🐾 Pets
                    </button>
                  )}

                  {user?.role !== 'VET' && (
                    <button
                      onClick={() => {
                        navigate('/find-vet');
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      🩺 Find a Vet
                    </button>
                  )}

                  {user?.role !== 'VET' && (
                    <button
                      onClick={() => {
                        navigate('/shop');
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      🛒 Shop
                    </button>
                  )}

                  <hr className="my-1" />

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
