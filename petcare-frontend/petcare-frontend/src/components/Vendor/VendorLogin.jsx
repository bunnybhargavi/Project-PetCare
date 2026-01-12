import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { vendorService } from '../../services/vendorService';

const VendorLogin = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP Verification
    const [formData, setFormData] = useState({
        email: '',
        otp: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleInitiateLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await vendorService.initiateLogin(formData);
            if (response.success) {
                setSuccess('OTP sent to your email! Please check your inbox and enter the verification code.');
                setStep(2);
            } else {
                setError(response.message || 'Failed to send OTP');
            }
        } catch (error) {
            setError(error.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await vendorService.completeLogin(formData);
            if (response.success) {
                navigate('/vendor/dashboard');
            } else {
                setError(response.message || 'OTP verification failed');
            }
        } catch (error) {
            setError(error.message || 'OTP verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        setError('');
        
        try {
            const response = await vendorService.initiateLogin(formData);
            if (response.success) {
                setSuccess('New OTP sent to your email!');
            } else {
                setError(response.message || 'Failed to resend OTP');
            }
        } catch (error) {
            setError(error.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full">
                            <span className="text-3xl">🏪</span>
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {step === 1 ? 'Vendor Login' : 'Verify Your Email'}
                    </h2>
                    <p className="text-gray-600">
                        {step === 1 
                            ? 'Sign in to your vendor account'
                            : 'Enter the verification code sent to your email'
                        }
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-600 text-sm">{success}</p>
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleInitiateLogin} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Sending OTP...
                                    </div>
                                ) : (
                                    'Send Verification Code'
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleCompleteLogin} className="space-y-6">
                            <div className="text-center mb-6">
                                <div className="bg-purple-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">📧</span>
                                </div>
                                <p className="text-gray-600">
                                    We've sent a 6-digit verification code to<br />
                                    <span className="font-medium text-gray-900">{formData.email}</span>
                                </p>
                            </div>

                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2 text-center">
                                    Enter Verification Code
                                </label>
                                <input
                                    id="otp"
                                    name="otp"
                                    type="text"
                                    required
                                    maxLength="6"
                                    value={formData.otp}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-lg font-mono tracking-widest"
                                    placeholder="000000"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Verifying...
                                    </div>
                                ) : (
                                    'Sign In'
                                )}
                            </button>

                            <div className="text-center">
                                <p className="text-gray-600 text-sm mb-2">
                                    Didn't receive the code?
                                </p>
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={loading}
                                    className="text-purple-600 hover:text-purple-700 font-medium text-sm disabled:opacity-50"
                                >
                                    Resend Code
                                </button>
                            </div>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-gray-500 hover:text-gray-700 text-sm"
                                >
                                    ← Back to Email
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Don't have a vendor account?{' '}
                            <Link to="/vendor/register" className="text-purple-600 hover:text-purple-700 font-medium">
                                Register here
                            </Link>
                        </p>
                    </div>

                    <div className="mt-4 text-center">
                        <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorLogin;