import React, { useEffect, useState } from 'react';
import Navbar from '../Layout/Navbar';
import { vetService } from '../../services/vetService';
import BookingModal from '../Appointments/BookingModal';
import { FaSearch, FaVideo, FaMapMarkerAlt, FaStethoscope, FaClock, FaDollarSign } from 'react-icons/fa';

const FindVetPage = () => {
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    specialization: '',
    location: '',
    teleconsultAvailable: null
  });
  const [bookingVet, setBookingVet] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      console.log('Loading vets from API...');
      const data = await vetService.listAll();
      console.log('Loaded vets data:', data); // Debug log
      console.log('Data type:', typeof data, 'Is array:', Array.isArray(data));
      
      // Ensure data is always an array
      if (Array.isArray(data)) {
        setVets(data);
      } else if (data && Array.isArray(data.data)) {
        // Handle case where data is wrapped in another object
        setVets(data.data);
      } else {
        console.warn('Unexpected data format:', data);
        setVets([]);
      }
    } catch (error) {
      console.error('Failed to load vets:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setVets([]); // Set empty array on error
      
      // More detailed error message
      let errorMsg = 'Failed to load veterinarians';
      if (error.response?.status === 404) {
        errorMsg += ': API endpoint not found. Make sure backend is running on port 8080.';
      } else if (error.message === 'Network Error') {
        errorMsg += ': Cannot connect to backend. Make sure backend is running on http://localhost:8080';
      } else {
        errorMsg += ': ' + (error.response?.data?.message || error.message);
      }
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Only send non-empty search params
      const params = {};
      if (searchParams.specialization) params.specialization = searchParams.specialization;
      if (searchParams.location) params.location = searchParams.location;
      if (searchParams.teleconsultAvailable !== null) params.teleconsultAvailable = searchParams.teleconsultAvailable;

      const data = await vetService.search(params);
      console.log('Search results:', data); // Debug log
      // Ensure data is always an array
      setVets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Search failed:', error);
      setVets([]); // Set empty array on error
      alert('Search failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchParams({
      specialization: '',
      location: '',
      teleconsultAvailable: null
    });
    loadAll();
  };

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/health');
      const text = await response.text();
      console.log('Backend health check:', text);
      return true;
    } catch (error) {
      console.error('Backend connection failed:', error);
      return false;
    }
  };

  useEffect(() => { 
    // Test backend first, then load vets
    testBackendConnection().then(isConnected => {
      if (isConnected) {
        loadAll();
      } else {
        alert('Backend is not running. Please start the backend server on port 8080.');
      }
    });
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Find a Veterinarian 🐾</h1>
            <p className="text-gray-600">Search for the perfect vet for your pet</p>
          </div>

          {/* Search Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaStethoscope className="inline mr-2" />
                  Specialization
                </label>
                <input
                  value={searchParams.specialization}
                  onChange={(e) => setSearchParams({ ...searchParams, specialization: e.target.value })}
                  placeholder="e.g., Dermatology"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline mr-2" />
                  Location
                </label>
                <input
                  value={searchParams.location}
                  onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                  placeholder="City or Address"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaVideo className="inline mr-2" />
                  Teleconsult
                </label>
                <select
                  value={searchParams.teleconsultAvailable === null ? '' : searchParams.teleconsultAvailable}
                  onChange={(e) => setSearchParams({
                    ...searchParams,
                    teleconsultAvailable: e.target.value === '' ? null : e.target.value === 'true'
                  })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">All</option>
                  <option value="true">Available</option>
                  <option value="false">Not Available</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={handleSearch}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <FaSearch /> Search
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading veterinarians...</p>
            </div>
          ) : vets.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow">
              <p className="text-6xl mb-4">🔍</p>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Veterinarians Found</h3>
              <p className="text-gray-500">Try adjusting your search filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vets.map((vet) => (
                <div key={vet.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border-2 border-transparent hover:border-blue-300">
                  {/* Vet Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{vet.user?.name || 'Dr. ' + vet.clinicName}</h3>
                      <p className="text-purple-600 font-semibold">{vet.clinicName}</p>
                    </div>
                    {vet.availableForTeleconsult && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                        <FaVideo /> Video
                      </span>
                    )}
                  </div>

                  {/* Specialization */}
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {vet.specialization}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    {vet.clinicAddress && (
                      <p className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-gray-400" />
                        {vet.clinicAddress}
                      </p>
                    )}
                    {vet.workingHours && (
                      <p className="flex items-center gap-2">
                        <FaClock className="text-gray-400" />
                        {vet.workingHours}
                      </p>
                    )}
                    {vet.consultationFee && (
                      <p className="flex items-center gap-2">
                        <FaDollarSign className="text-gray-400" />
                        ${vet.consultationFee} consultation fee
                      </p>
                    )}
                    {vet.yearsOfExperience && (
                      <p className="text-gray-500">
                        {vet.yearsOfExperience} years of experience
                      </p>
                    )}
                  </div>

                  {/* Bio */}
                  {vet.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{vet.bio}</p>
                  )}

                  {/* Book Button */}
                  <button
                    onClick={() => setBookingVet(vet)}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                  >
                    Book Appointment
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Booking Modal */}
          {bookingVet && (
            <BookingModal
              preSelectedVet={bookingVet}
              onClose={() => setBookingVet(null)}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default FindVetPage;

