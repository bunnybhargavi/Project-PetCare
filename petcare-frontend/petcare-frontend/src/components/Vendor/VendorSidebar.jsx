import React from 'react';

const VendorSidebar = ({ currentView, setCurrentView, vendor, onLogout }) => {
    const menuItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: '🏠',
            description: 'Overview & Stats'
        },
        {
            id: 'products',
            label: 'Products',
            icon: '📦',
            description: 'Manage Inventory'
        },
        {
            id: 'orders',
            label: 'Orders',
            icon: '📋',
            description: 'Customer Orders'
        }
    ];

    return (
        <div 
            className="w-64 flex flex-col h-full shadow-lg"
            style={{backgroundColor: '#F5F3FF'}}
        >
            {/* Logo/Brand */}
            <div className="p-6 border-b" style={{borderColor: '#E9D5FF'}}>
                <div className="flex items-center space-x-3">
                    <div 
                        className="p-2 rounded-2xl"
                        style={{backgroundColor: '#FFE5F0'}}
                    >
                        <span className="text-2xl">🏪</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold" style={{color: '#8B4789'}}>
                            Vendor Portal
                        </h2>
                        <p className="text-sm opacity-75" style={{color: '#8B4789'}}>
                            Pet Care Marketplace
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 py-6">
                <ul className="space-y-2 px-4">
                    {menuItems.map((item) => (
                        <li key={item.id}>
                            <button
                                onClick={() => setCurrentView(item.id)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 hover:scale-105 ${
                                    currentView === item.id
                                        ? 'shadow-sm'
                                        : 'hover:shadow-sm'
                                }`}
                                style={{
                                    backgroundColor: currentView === item.id ? '#FFE5F0' : 'transparent',
                                    color: '#8B4789'
                                }}
                            >
                                <div 
                                    className="w-8 h-8 rounded-full flex items-center justify-center"
                                    style={{
                                        backgroundColor: currentView === item.id ? '#8B4789' : '#FFE5F0'
                                    }}
                                >
                                    <span 
                                        className="text-lg"
                                        style={{
                                            filter: currentView === item.id ? 'invert(1)' : 'none'
                                        }}
                                    >
                                        {item.icon}
                                    </span>
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-medium text-sm">{item.label}</p>
                                    <p className="text-xs opacity-75">{item.description}</p>
                                </div>
                                {currentView === item.id && (
                                    <div className="ml-auto">
                                        <span className="text-lg">🐾</span>
                                    </div>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Vendor Info */}
            <div className="p-4 border-t" style={{borderColor: '#E9D5FF'}}>
                <div 
                    className="rounded-2xl p-4 mb-4 relative overflow-hidden"
                    style={{backgroundColor: '#FFE5F0'}}
                >
                    <div className="flex items-center space-x-3 relative z-10">
                        <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{background: 'linear-gradient(135deg, #8B4789 0%, #E5498D 100%)'}}
                        >
                            <span className="text-lg font-bold text-white">
                                {vendor?.businessName?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{color: '#8B4789'}}>
                                {vendor?.businessName}
                            </p>
                            <p className="text-xs opacity-75 truncate" style={{color: '#8B4789'}}>
                                {vendor?.email}
                            </p>
                        </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="mt-3 relative z-10">
                        <span 
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                                backgroundColor: vendor?.status === 'APPROVED' ? '#E8F8F5' : 
                                               vendor?.status === 'PENDING' ? '#FFE5D9' : '#FEE2E2',
                                color: vendor?.status === 'APPROVED' ? '#10B981' : 
                                       vendor?.status === 'PENDING' ? '#F59E0B' : '#EF4444'
                            }}
                        >
                            {vendor?.status === 'APPROVED' && '✅ Approved'}
                            {vendor?.status === 'PENDING' && '⏳ Pending'}
                            {vendor?.status === 'SUSPENDED' && '🚫 Suspended'}
                            {vendor?.status === 'REJECTED' && '❌ Rejected'}
                        </span>
                    </div>
                    
                    {/* Paw print decoration */}
                    <div className="absolute top-2 right-2 opacity-20" style={{color: '#8B4789'}}>
                        <span className="text-2xl">🐾</span>
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-sm"
                    style={{backgroundColor: '#FFE5F0', color: '#8B4789'}}
                >
                    <span className="text-lg">🚪</span>
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default VendorSidebar;