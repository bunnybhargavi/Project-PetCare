import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { FaPaw, FaUser, FaEnvelope, FaPhone, FaStethoscope, FaHospital } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    role: 'OWNER',
    clinicName: '',
    specialization: '',
  });

  const [otp, setOtp] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // Step 1: Initiate Registration (Send OTP)
  const handleInitiate = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.name || !formData.phone) {
      setError('Please fill in all required fields');
      return;
    }
    if (formData.role === 'VET' && !formData.clinicName) {
      setError('Clinic name is required for veterinarians');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authService.initiateRegistration(formData);
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
      toast.error('Failed to initiate registration');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Complete Registration (Verify OTP + Create Account)
  const handleComplete = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(formData.email, otp, formData);
      toast.success('Registration successful! Welcome to PawHaven.');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Incorrect OTP or issues with server.');
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🐾</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {step === 1 ? 'Create account' : 'Verify Email'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 1 ? 'Start your journey with PawHaven' : 'Enter the OTP sent to your email'}
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {step === 1 ? (
          /* Step 1 Form */
          <form onSubmit={handleInitiate} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm space-y-4">

              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    name="name"
                    type="text"
                    required
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1">Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    name="phone"
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-2">I am a</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'OWNER' })}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center space-x-2 ${formData.role === 'OWNER'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                  >
                    <FaPaw className={formData.role === 'OWNER' ? 'text-indigo-600' : 'text-gray-400'} />
                    <span>Pet Owner</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'VET' })}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center space-x-2 ${formData.role === 'VET'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                  >
                    <FaStethoscope className={formData.role === 'VET' ? 'text-indigo-600' : 'text-gray-400'} />
                    <span>Veterinarian</span>
                  </button>
                </div>
              </div>

              {/* Vet Specific */}
              {formData.role === 'VET' && (
                <div className="grid grid-cols-1 gap-4 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1">Clinic Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaHospital className="text-gray-400" />
                      </div>
                      <input
                        name="clinicName"
                        type="text"
                        required={formData.role === 'VET'}
                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Clinic Name (required)"
                        value={formData.clinicName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1">Specialization</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaStethoscope className="text-gray-400" />
                      </div>
                      <input
                        name="specialization"
                        type="text"
                        className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150 ease-in-out"
            >
              {loading ? 'Sending OTP...' : 'Next: Verify Email'}
            </button>
          </form>
        ) : (
          /* Step 2 Form */
          <form onSubmit={handleComplete} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm space-y-4">

              {/* OTP Input */}
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1">OTP</label>
                <p className="text-xs text-gray-500 mb-2">Please enter the 6-digit code sent to {formData.email}</p>
                <input
                  name="otp"
                  type="text"
                  maxLength="6"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm tracking-widest text-center text-lg"
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150 ease-in-out"
              >
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                Back
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-4">
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign in to existing account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;