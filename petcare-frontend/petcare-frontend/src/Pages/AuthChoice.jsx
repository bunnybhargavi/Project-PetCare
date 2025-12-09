import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUserMd, FaPaw, FaArrowLeft } from 'react-icons/fa';

const AuthChoice = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
            {/* Back Button */}
            <Link
                to="/"
                className="absolute top-8 left-8 flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors"
            >
                <FaArrowLeft />
                <span>Back to Home</span>
            </Link>

            <div className="max-w-6xl w-full">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <span className="text-4xl">🐾</span>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Welcome to PawHaven
                        </h1>
                    </div>
                    <p className="text-xl text-gray-600">Choose how you'd like to get started</p>
                </motion.div>

                {/* Choice Cards */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Login Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                        onClick={() => navigate('/login')}
                        className="cursor-pointer bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all p-8 border-2 border-transparent hover:border-indigo-500"
                    >
                        <div className="text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sign In</h2>
                            <p className="text-gray-600 mb-6">
                                Already have an account? Login to access your pet's health records and appointments.
                            </p>
                            <div className="inline-flex items-center text-indigo-600 font-semibold">
                                Continue to Login
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>

                    {/* Register Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                        onClick={() => navigate('/register')}
                        className="cursor-pointer bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl shadow-xl hover:shadow-2xl transition-all p-8 text-white relative overflow-hidden"
                    >
                        {/* Decorative circles */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

                        <div className="text-center relative z-10">
                            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Create Account</h2>
                            <p className="text-indigo-100 mb-6">
                                New to PawHaven? Sign up now to start managing your pet's health and wellness journey.
                            </p>
                            <div className="inline-flex items-center font-semibold">
                                Get Started Free
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Role Preview Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg"
                >
                    <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
                        Who uses PawHaven?
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Pet Owners */}
                        <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-white/80 transition-colors">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                                    <FaPaw className="text-purple-600 text-xl" />
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2">Pet Owners</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Track your pet's health records</li>
                                    <li>• Schedule vet appointments</li>
                                    <li>• Get vaccination reminders</li>
                                    <li>• Connect with trusted vets</li>
                                </ul>
                            </div>
                        </div>

                        {/* Veterinarians */}
                        <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-white/80 transition-colors">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                                    <FaUserMd className="text-indigo-600 text-xl" />
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2">Veterinarians</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Manage patient records digitally</li>
                                    <li>• Schedule appointments efficiently</li>
                                    <li>• Provide teleconsultations</li>
                                    <li>• Grow your practice</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Footer Note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-center text-gray-500 text-sm mt-8"
                >
                    By continuing, you agree to our{' '}
                    <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>
                </motion.p>
            </div>
        </div>
    );
};

export default AuthChoice;
