import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vendorService } from '../../services/vendorService';
import VendorSidebar from './VendorSidebar';
import VendorDashboardHome from './VendorDashboardHome';
import VendorProducts from './VendorProducts';
import VendorOrders from './VendorOrders';

const VendorDashboard = () => {
    const navigate = useNavigate();
    const [currentView, setCurrentView] = useState('dashboard');
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if vendor is logged in
        if (!vendorService.isVendorLoggedIn()) {
            navigate('/vendor/login');
            return;
        }

        // Get vendor data
        const vendorData = vendorService.getCurrentVendor();
        setVendor(vendorData);
        setLoading(false);
    }, [navigate]);

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            vendorService.logout();
            navigate('/vendor/login');
        }
    };

    if (loading) {
        return (
            <div 
                className="min-h-screen flex items-center justify-center"
                style={{backgroundColor: '#FAFAF9'}}
            >
                <div className="text-center">
                    <div 
                        className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto"
                        style={{borderColor: '#8B4789'}}
                    ></div>
                    <p className="mt-4" style={{color: '#8B4789'}}>Loading...</p>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        switch (currentView) {
            case 'dashboard':
                return <VendorDashboardHome vendor={vendor} setCurrentView={setCurrentView} />;
            case 'products':
                return <VendorProducts vendor={vendor} />;
            case 'orders':
                return <VendorOrders vendor={vendor} />;
            default:
                return <VendorDashboardHome vendor={vendor} setCurrentView={setCurrentView} />;
        }
    };

    return (
        <div 
            className="min-h-screen flex"
            style={{backgroundColor: '#FAFAF9'}}
        >
            {/* Sidebar */}
            <VendorSidebar 
                currentView={currentView}
                setCurrentView={setCurrentView}
                vendor={vendor}
                onLogout={handleLogout}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header 
                    className="bg-white shadow-sm border-b"
                    style={{borderColor: '#E9D5FF'}}
                >
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold" style={{color: '#8B4789'}}>
                                    {currentView === 'dashboard' && '🏠 Dashboard'}
                                    {currentView === 'products' && '📦 Products'}
                                    {currentView === 'orders' && '📋 Orders'}
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Welcome back, {vendor?.contactName}! 🐾
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-sm font-medium" style={{color: '#8B4789'}}>
                                        {vendor?.businessName}
                                    </p>
                                    <p className="text-xs text-gray-500">{vendor?.email}</p>
                                </div>
                                <div 
                                    className="w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{background: 'linear-gradient(135deg, #8B4789 0%, #E5498D 100%)'}}
                                >
                                    <span className="text-white font-bold text-lg">
                                        {vendor?.businessName?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default VendorDashboard;