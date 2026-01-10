import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { vendorService } from '../../services/vendorService';

const VendorRegister = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification
    const [formData, setFormData] = useState({
        businessName: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        businessLicense: '',
        taxId: '',
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

    const handleInitiateRegistration = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Clean the form data - only include non-empty values
        const cleanFormData = {
            businessName: formData.businessName?.trim(),
            contactName: formData.contactName?.trim(),
            email: formData.email?.trim()
        };

        // Only add optional fields if they have values
        if (formData.phone?.trim()) {
            cleanFormData.phone = formData.phone.trim();
        }
        if (formData.address?.trim()) {
            cleanFormData.address = formData.address.trim();
        }
        if (formData.city?.trim()) {
            cleanFormData.city = formData.city.trim();
        }
        if (formData.state?.trim()) {
            cleanFormData.state = formData.state.trim();
        }
        if (formData.zipCode?.trim()) {
            cleanFormData.zipCode = formData.zipCode.trim();
        }
        if (formData.businessLicense?.trim()) {
            cleanFormData.businessLicense = formData.businessLicense.trim();
        }
        if (formData.taxId?.trim()) {
            cleanFormData.taxId = formData.taxId.trim();
        }

        console.log('Initiating registration with data:', cleanFormData);

        try {
            const response = await vendorService.initiateRegistration(cleanFormData);
            console.log('Registration response:', response);
            
            if (response.success) {
                setSuccess('OTP sent to your email! Please check your inbox and enter the verification code.');
                setStep(2);
            } else {
                setError(response.message || 'Failed to send OTP');
            }
        } catch (error) {
            console.error('Registration error:', error);
            // Handle different types of errors
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else if (error.message) {
                setError(error.message);
            } else if (typeof error === 'string') {
                setError(error);
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteRegistration = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await vendorService.completeRegistration(formData);
            
            if (response.success) {
                // Store vendor data and token for immediate login
                localStorage.setItem('vendorToken', 'vendor_' + response.data.id);
                localStorage.setItem('vendorData', JSON.stringify(response.data));
                
                setSuccess('Registration successful! Redirecting to dashboard...');
                setTimeout(() => {
                    navigate('/vendor/dashboard');
                }, 1500);
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
            const response = await vendorService.initiateRegistration(formData);
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
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full">
                            <span className="text-3xl">🏪</span>
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {step === 1 ? 'Become a Vendor' : 'Verify Your Email'}
                    </h2>
                    <p className="text-gray-600">
                        {step === 1 
                            ? 'Join our marketplace and start selling your pet products'
                            : 'Enter the verification code sent to your email'
                        }
                    </p>
                </div>

                {/* Registration Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-600 text-sm">{success}</p>
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleInitiateRegistration} className="space-y-6">
                            {/* Business Information */}
                            <div className="border-b border-gray-200 pb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                                            Business Name *
                                        </label>
                                        <input
                                            id="businessName"
                                            name="businessName"
                                            type="text"
                                            required
                                            value={formData.businessName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Your business name"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                                            Contact Name *
                                        </label>
                                        <input
                                            id="contactName"
                                            name="contactName"
                                            type="text"
                                            required
                                            value={formData.contactName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Your full name"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Account Information */}
                            <div className="border-b border-gray-200 pb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address Information */}
                            <div className="border-b border-gray-200 pb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Business Address</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                            Street Address
                                        </label>
                                        <input
                                            id="address"
                                            name="address"
                                            type="text"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="123 Business Street"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                                                City
                                            </label>
                                            <input
                                                id="city"
                                                name="city"
                                                type="text"
                                                value={formData.city}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                placeholder="City"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                                                State
                                            </label>
                                            <input
                                                id="state"
                                                name="state"
                                                type="text"
                                                value={formData.state}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                placeholder="State"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                                                ZIP Code
                                            </label>
                                            <input
                                                id="zipCode"
                                                name="zipCode"
                                                type="text"
                                                value={formData.zipCode}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                placeholder="12345"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Business Documents */}
                            <div className="pb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Business Documents (Optional)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="businessLicense" className="block text-sm font-medium text-gray-700 mb-2">
                                            Business License Number
                                        </label>
                                        <input
                                            id="businessLicense"
                                            name="businessLicense"
                                            type="text"
                                            value={formData.businessLicense}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="License number"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-2">
                                            Tax ID / EIN
                                        </label>
                                        <input
                                            id="taxId"
                                            name="taxId"
                                            type="text"
                                            value={formData.taxId}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Tax ID"
                                        />
                                    </div>
                                </div>
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
                        /* OTP Verification Step */
                        <form onSubmit={handleCompleteRegistration} className="space-y-6">
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
                                    'Complete Registration'
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
                                    ← Back to Form
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Already have a vendor account?{' '}
                            <Link to="/vendor/login" className="text-purple-600 hover:text-purple-700 font-medium">
                                Sign in here
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

export default VendorRegister;