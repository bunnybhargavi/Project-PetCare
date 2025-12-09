import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPaw, FaUser, FaEnvelope, FaPhone, FaUserMd } from 'react-icons/fa';
import toast from 'react-hot-toast';
import authService from '../../services/authService';

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'OWNER', // Default to pet owner
    clinicName: '',
    specialization: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all fields');
      return false;
    }

    if (formData.role === 'VET' && !formData.clinicName) {
      toast.error('Clinic name is required for veterinarians');
      return false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        clinicName: formData.clinicName || null,
        specialization: formData.specialization || null,
      };

      // Store registration data for later use in OTP verification
      sessionStorage.setItem('registrationData', JSON.stringify(registrationData));

      await authService.initiateRegistration(registrationData);
      
      toast.success('OTP sent to your email! Check your inbox.');
      navigate('/verify-otp', { state: { email: formData.email, userData: registrationData } });
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 p-4">
      <div className="absolute inset-0 bg-black/10"></div>
      
      <div className="relative w-full max-w-md animate-scaleIn">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
              <FaPaw className="text-3xl text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Join PetCare</h1>
            <p className="text-purple-100">Create your free account today</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I am a:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'OWNER' })}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      formData.role === 'OWNER'
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-300 hover:border-indigo-300'
                    }`}
                  >
                    <FaPaw className="mx-auto text-2xl mb-2 text-indigo-600" />
                    <div className="font-semibold">Pet Owner</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'VET' })}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      formData.role === 'VET'
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-300 hover:border-indigo-300'
                    }`}
                  >
                    <FaUserMd className="mx-auto text-2xl mb-2 text-indigo-600" />
                    <div className="font-semibold">Veterinarian</div>
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="1234567890"
                  />
                </div>
              </div>

              {/* Vet-specific fields */}
              {formData.role === 'VET' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Name</label>
                    <input
                      type="text"
                      name="clinicName"
                      value={formData.clinicName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Clinic Name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialization (optional)</label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="e.g., Surgery, Dermatology"
                    />
                  </div>
                </>
              )}

              {/* Terms */}
              <div className="flex items-start">
                <input type="checkbox" className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" required />
                <label className="ml-2 text-sm text-gray-600">
                  I agree to the <a href="#" className="text-indigo-600 hover:text-indigo-700">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:text-indigo-700">Privacy Policy</a>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Already have an account?{' '}
                <button onClick={() => navigate('/login')} className="text-indigo-600 hover:text-indigo-700 font-semibold">
                  Login
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;