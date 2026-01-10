// FILE: src/pages/LandingPage.jsx
// Enhanced Pet-Themed Landing Page with personality!

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPaw, FaHeartbeat, FaCalendarAlt, FaShoppingCart, FaUserMd, FaBell, FaBone, FaHeart, FaHome } from 'react-icons/fa';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [floatingPaws, setFloatingPaws] = useState([]);

  // Generate random floating paw prints
  useEffect(() => {
    const paws = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10
    }));
    setFloatingPaws(paws);
  }, []);

  const features = [
    {
      icon: <FaPaw className="w-10 h-10" />,
      title: "Pet Profiles",
      description: "Create pawsome profiles for your fur babies with photos, treats preferences, and belly rub schedules!",
      color: "from-orange-400 to-pink-500"
    },
    {
      icon: <FaHeartbeat className="w-10 h-10" />,
      title: "Health Tracking",
      description: "Keep those tails wagging with health monitoring, weight tracking, and wellness reports",
      color: "from-red-400 to-rose-500"
    },
    {
      icon: <FaCalendarAlt className="w-10 h-10" />,
      title: "Vet Appointments",
      description: "Book playdates with the vet - in-person or virtual! Your pet won't mind (we promise)",
      color: "from-blue-400 to-cyan-500"
    },
    {
      icon: <FaBell className="w-10 h-10" />,
      title: "Smart Reminders",
      description: "Never forget vaccination days, grooming sessions, or those very important treat times",
      color: "from-purple-400 to-indigo-500"
    },
    {
      icon: <FaShoppingCart className="w-10 h-10" />,
      title: "Pet Marketplace",
      description: "Shop for premium toys, gourmet treats, and everything to spoil your furry friends",
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: <FaUserMd className="w-10 h-10" />,
      title: "Vet Network",
      description: "Connect with caring veterinarians who love animals as much as you do",
      color: "from-teal-400 to-cyan-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah & Max",
      role: "Golden Retriever Parent",
      image: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=400&fit=crop",
      text: "Max gets so excited when he sees me open the app - he knows it's either treat time or a walk reminder! Best pet app ever! 🐕",
      petName: "Max"
    },
    {
      name: "Dr. Michael Chen",
      role: "Veterinarian",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop",
      text: "My patients' parents are so much more organized now. Plus, the pet photos brighten my day! 😊",
      petName: null
    },
    {
      name: "Emily & her Trio",
      role: "Cat Mom x3",
      image: "https://images.unsplash.com/photo-1573865526739-10c1dd0c6f4e?w=400&h=400&fit=crop",
      text: "Managing Whiskers, Mittens, and Sir Fluffington used to be chaos. Now it's purr-fectly organized! 🐱",
      petName: "Whiskers"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Floating Paw Prints Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {floatingPaws.map((paw) => (
          <div
            key={paw.id}
            className="absolute text-orange-200 opacity-20"
            style={{
              left: `${paw.left}%`,
              animation: `floatUp ${paw.duration}s linear infinite`,
              animationDelay: `${paw.delay}s`,
              fontSize: '40px'
            }}
          >
            🐾
          </div>
        ))}
      </div>

      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        
        .wiggle-on-hover:hover {
          animation: wiggle 0.5s ease-in-out infinite;
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-lg shadow-lg z-50 border-b-4 border-orange-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate('/')}>
              {/* Composed Logo: House with Paw */}
              <div className="relative flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-md p-1">
                <FaHome className="text-teal-500 text-4xl" />
                <div className="absolute inset-0 flex items-center justify-center pt-1">
                  <FaPaw className="text-white text-lg" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-black bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                  PawHaven
                </span>
                <div className="text-xs text-gray-500 font-semibold">Where Tails Wag & Purrs Happen</div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-700 hover:text-orange-500 font-semibold transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-orange-500 font-semibold transition-colors">How It Works</a>
              <a href="#testimonials" className="text-gray-700 hover:text-orange-500 font-semibold transition-colors">Happy Tails</a>

              {/* Vendor Dropdown */}
              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-700 hover:text-orange-500 font-semibold transition-colors">
                  <span>🏪 Vendor</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Vendor Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 ring-1 ring-black ring-opacity-5 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
                  <button
                    onClick={() => navigate('/vendor/login')}
                    className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 font-semibold transition-colors"
                  >
                    🔑 Vendor Login
                  </button>
                  <button
                    onClick={() => navigate('/vendor/register')}
                    className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 font-semibold transition-colors"
                  >
                    📝 Become a Vendor
                  </button>
                </div>
              </div>

              <button
                onClick={() => navigate('/auth')}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <FaPaw className="text-sm" />
                Join Free!
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-orange-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-3 animate-slideInBottom">
              <a href="#features" className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded-lg font-semibold">Features</a>
              <a href="#how-it-works" className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded-lg font-semibold">How It Works</a>
              <a href="#testimonials" className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded-lg font-semibold">Happy Tails</a>

              {/* Mobile Vendor Options */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="px-4 py-2 text-sm font-bold text-gray-500 uppercase tracking-wide">Vendor Portal</div>
                <button
                  onClick={() => navigate('/vendor/login')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50 rounded-lg font-semibold"
                >
                  🔑 Vendor Login
                </button>
                <button
                  onClick={() => navigate('/vendor/register')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50 rounded-lg font-semibold"
                >
                  📝 Become a Vendor
                </button>
              </div>

              <button onClick={() => navigate('/auth')} className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-bold">
                Join Free!
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-slideInBottom relative z-10">
              <div className="inline-block mb-4">
                <span className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  🎉 Trusted by 10,000+ Pet Parents
                </span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
                Your Pet's
                <span className="block bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                  Happy Place! 🐾
                </span>
              </h1>
              <p className="text-2xl text-gray-700 mb-8 font-medium">
                Because every wag, purr, and chirp deserves the best care! Manage health records, book vet visits, and spoil your furry friends - all in one pawsome app.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => navigate('/auth')}
                  className="px-10 py-5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full text-xl font-black shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
                >
                  <FaPaw />
                  Start Free Today!
                </button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 flex-wrap">
                <div className="bg-white rounded-2xl p-4 shadow-lg">
                  <div className="text-4xl font-black text-orange-500">10K+</div>
                  <div className="text-gray-600 font-semibold">Happy Pets 🐶</div>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-lg">
                  <div className="text-4xl font-black text-pink-500">500+</div>
                  <div className="text-gray-600 font-semibold">Expert Vets 🩺</div>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-lg">
                  <div className="text-4xl font-black text-purple-500">50K+</div>
                  <div className="text-gray-600 font-semibold">Health Records 📋</div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative animate-fadeIn">
              {/* Decorative Elements */}
              <div className="absolute -top-10 -right-10 text-8xl opacity-20">🦴</div>
              <div className="absolute -bottom-10 -left-10 text-8xl opacity-20">🎾</div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 rounded-[3rem] transform rotate-6 blur-sm"></div>
                <div className="relative bg-white rounded-[3rem] shadow-2xl p-4 border-8 border-white">
                  <img
                    src="https://oshiprint.in/image/cache/catalog/poster/new/mqp1024-1100x733.jpeg.webp"
                    alt="Happy pets playing"
                    className="rounded-3xl w-full h-[500px] object-cover"
                  />

                  {/* Floating Health Badge */}
                  <div className="absolute -bottom-6 -left-6 bg-white rounded-3xl shadow-2xl p-5 border-4 border-green-300 animate-pulse wiggle-on-hover">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 p-4 rounded-2xl">
                        <FaHeartbeat className="text-green-600 text-3xl" />
                      </div>
                      <div>
                        <div className="font-black text-lg">All Pets Healthy!</div>
                        <div className="text-sm text-gray-600 font-semibold">100% Happy Tails 🎉</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white relative">
        {/* Decorative Paw Prints */}
        <div className="absolute top-10 left-10 text-6xl opacity-10 rotate-12">🐾</div>
        <div className="absolute bottom-10 right-10 text-6xl opacity-10 -rotate-12">🐾</div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block bg-orange-100 text-orange-600 px-6 py-2 rounded-full font-bold mb-4">
              ✨ Amazing Features
            </div>
            <h2 className="text-5xl font-black mb-4">Everything Your Furry Friend Needs</h2>
            <p className="text-xl text-gray-600 font-medium">Tail-wagging good features designed with love 💕</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-gradient-to-br from-white to-orange-50 rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-300 animate-fadeIn border-4 border-transparent hover:border-orange-200"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`bg-gradient-to-br ${feature.color} w-20 h-20 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 font-medium leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vendor Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 text-9xl">🏪</div>
          <div className="absolute bottom-1/4 right-1/4 text-9xl">💼</div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-block bg-purple-100 text-purple-600 px-6 py-2 rounded-full font-bold mb-4">
                🏪 For Business Owners
              </div>
              <h2 className="text-5xl font-black mb-6 leading-tight">
                Sell Pet Products &
                <span className="block bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                  Grow Your Business! 📈
                </span>
              </h2>
              <p className="text-xl text-gray-700 mb-8 font-medium">
                Join our marketplace and reach thousands of pet parents looking for quality products. Easy setup, powerful tools, and happy customers await!
              </p>

              {/* Vendor Benefits */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <div className="font-bold text-lg">Increase Sales</div>
                    <div className="text-gray-600">Reach 10,000+ active pet parents</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <div className="font-bold text-lg">Easy Management</div>
                    <div className="text-gray-600">Simple dashboard to manage products & orders</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <div>
                    <div className="font-bold text-lg">Quick Setup</div>
                    <div className="text-gray-600">Get started in minutes, not days</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/vendor/register')}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
                >
                  🏪 Become a Vendor
                </button>
                <button
                  onClick={() => navigate('/vendor/login')}
                  className="px-8 py-4 bg-white text-purple-600 border-2 border-purple-600 rounded-full text-lg font-bold hover:bg-purple-50 transition-all duration-200 flex items-center justify-center gap-3"
                >
                  🔑 Vendor Login
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="absolute -top-6 -right-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl transform rotate-6 blur-sm w-full h-full"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-6 border-4 border-white">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-2">🏪</div>
                    <div className="font-black text-2xl text-gray-800">Vendor Dashboard</div>
                    <div className="text-gray-600">Manage your pet business</div>
                  </div>

                  {/* Mock Dashboard Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="text-2xl font-black text-green-600">156</div>
                      <div className="text-sm text-gray-600">Products Sold</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="text-2xl font-black text-blue-600">$2,340</div>
                      <div className="text-sm text-gray-600">Monthly Revenue</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="text-2xl font-black text-purple-600">23</div>
                      <div className="text-sm text-gray-600">Active Products</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="text-2xl font-black text-orange-600">4.9⭐</div>
                      <div className="text-sm text-gray-600">Customer Rating</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-4 text-center">
                    <div className="font-bold">Ready to start selling?</div>
                    <div className="text-sm opacity-90">Join 500+ successful vendors</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Pet Journey Style */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-orange-50 to-pink-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 text-9xl">🦴</div>
          <div className="absolute top-1/2 right-1/4 text-9xl">🎾</div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block bg-pink-100 text-pink-600 px-6 py-2 rounded-full font-bold mb-4">
              🚀 Simple & Fun
            </div>
            <h2 className="text-5xl font-black mb-4">Your Pet's Journey Starts Here!</h2>
            <p className="text-xl text-gray-600 font-medium">Just 4 pawsteps to happiness</p>
          </div>

          <div className="relative grid md:grid-cols-4 gap-8">
            {[
              { emoji: "📝", title: "Sign Up", desc: "Create your free account in 30 seconds!", color: "from-blue-400 to-cyan-500" },
              { emoji: "🐕", title: "Add Pets", desc: "Create profiles for your adorable fur babies!", color: "from-orange-400 to-pink-500" },
              { emoji: "📊", title: "Track Health", desc: "Monitor wellness and set reminders!", color: "from-purple-400 to-pink-500" },
              { emoji: "🎉", title: "Be Happy!", desc: "Enjoy peace of mind with your pets!", color: "from-green-400 to-teal-500" }
            ].map((step, index) => (
              <div key={index} className="relative text-center animate-slideInBottom" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="relative mb-8">
                  <div className={`w-28 h-28 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center text-white text-5xl font-black mx-auto shadow-2xl hover:scale-110 transition-transform relative z-10`}>
                    {step.emoji}
                  </div>
                  {index < 3 && (
                    <div
                      className="hidden md:block absolute top-1/2 h-1 bg-gradient-to-r from-orange-300 to-pink-300 z-0"
                      style={{
                        left: 'calc(50% + 3.5rem)',
                        width: 'calc(100% + 2rem - 7rem)'
                      }}
                    ></div>
                  )}
                  <div className="absolute -top-2 -left-2 bg-white rounded-full w-10 h-10 flex items-center justify-center font-black text-orange-500 shadow-lg border-4 border-orange-200 z-20">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-2xl font-black mb-3 text-gray-800">{step.title}</h3>
                <p className="text-gray-600 font-medium leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Happy Tails */}
      <section id="testimonials" className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-purple-100 text-purple-600 px-6 py-2 rounded-full font-bold mb-4">
              💜 Happy Tails
            </div>
            <h2 className="text-5xl font-black mb-4">Loved by Pets & Their Humans!</h2>
            <p className="text-xl text-gray-600 font-medium">Real stories from our pawsome community</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white via-orange-50 to-pink-50 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all animate-scaleIn border-4 border-orange-200 hover:border-pink-300 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center mb-6">
                  <img src={testimonial.image} alt={testimonial.name} className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover mr-4 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-black text-xl text-gray-800">{testimonial.name}</div>
                    <div className="text-orange-600 font-semibold">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 font-medium text-lg leading-relaxed mb-4">"{testimonial.text}"</p>
                <div className="flex text-yellow-400 text-2xl">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Fun Style */}
      <section className="py-24 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-20 text-9xl animate-pulse">🐾</div>
          <div className="absolute bottom-10 right-20 text-9xl animate-pulse" style={{ animationDelay: '1s' }}>🐾</div>
        </div>

        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <div className="text-7xl mb-6">🐶 🐱 🐹 🐰</div>
          <h2 className="text-5xl font-black text-white mb-6 leading-tight">Ready for Tail-Wagging Adventures?</h2>
          <p className="text-2xl text-white/90 mb-10 font-semibold">Join thousands of happy pet parents today. It's free forever! 🎉</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/auth')}
              className="px-12 py-6 bg-white text-orange-600 rounded-full text-2xl font-black shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
            >
              <FaPaw />
              Create Free Account
            </button>
          </div>
          <div className="mt-8 text-white/80 font-semibold">
            ✨ No credit card required • 🔒 100% secure • 💝 Cancel anytime
          </div>
        </div>
      </section>

      {/* Footer - Playful */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-white p-2 rounded-xl">
                  <div className="relative flex items-center justify-center w-8 h-8">
                    <FaHome className="text-teal-500 text-3xl" />
                    <div className="absolute inset-0 flex items-center justify-center pt-1">
                      <FaPaw className="text-white text-sm" />
                    </div>
                  </div>
                </div>
                <span className="text-2xl font-black text-white">PawHaven</span>
              </div>
              <p className="text-sm font-medium">Where every pet gets the royal treatment they deserve! 👑</p>
            </div>
            <div>
              <h4 className="font-black text-white mb-4 text-lg">Product</h4>
              <ul className="space-y-2 text-sm font-medium">
                <li><a href="#features" className="hover:text-orange-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">For Vets</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-white mb-4 text-lg">Company</h4>
              <ul className="space-y-2 text-sm font-medium">
                <li><a href="#" className="hover:text-orange-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-white mb-4 text-lg">Legal</h4>
              <ul className="space-y-2 text-sm font-medium">
                <li><a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="font-medium">© 2024 PetCare. Made with 💕 for pets everywhere.</p>
            <p className="text-sm mt-2 text-gray-500">Bringing joy to 10,000+ tails daily! 🐾</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;