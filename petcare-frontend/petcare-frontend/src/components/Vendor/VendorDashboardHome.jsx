import React, { useState, useEffect } from 'react';
import { vendorService } from '../../services/vendorService';

const VendorDashboardHome = ({ vendor, setCurrentView }) => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalSales: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                
                // Fetch dashboard stats
                const statsResponse = await vendorService.getDashboardStats(vendor.id);
                if (statsResponse.success) {
                    setStats(statsResponse.data);
                }

                // Fetch recent orders
                const ordersResponse = await vendorService.getVendorOrders(vendor.id);
                if (ordersResponse.success) {
                    setRecentOrders(ordersResponse.data.slice(0, 5)); // Get latest 5 orders
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (vendor?.id) {
            fetchDashboardData();
        }
    }, [vendor]);

    const handleAddProduct = () => {
        console.log('🚀 Navigating to Products page to add new product');
        setCurrentView('products');
        // Show a brief notification
        setTimeout(() => {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 24px;
                right: 24px;
                background: linear-gradient(135deg, #8B4789 0%, #E5498D 100%);
                color: white;
                padding: 16px 24px;
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(139, 71, 137, 0.3);
                z-index: 1000;
                font-weight: 500;
                transform: translateX(100%);
                transition: transform 0.3s ease-out;
            `;
            notification.textContent = '📦 Navigate to Products page - Click "Add Product" to create new items!';
            document.body.appendChild(notification);
            
            setTimeout(() => notification.style.transform = 'translateX(0)', 100);
            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }, 4000);
        }, 500);
    };

    const handleManageOrders = () => {
        console.log('🚀 Navigating to Orders page');
        setCurrentView('orders');
        // Show a brief notification
        setTimeout(() => {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 24px;
                right: 24px;
                background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                color: white;
                padding: 16px 24px;
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
                z-index: 1000;
                font-weight: 500;
                transform: translateX(100%);
                transition: transform 0.3s ease-out;
            `;
            notification.textContent = '📋 Welcome to Orders management - Track and update your orders here!';
            document.body.appendChild(notification);
            
            setTimeout(() => notification.style.transform = 'translateX(0)', 100);
            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }, 4000);
        }, 500);
    };

    const handleViewAnalytics = () => {
        console.log('📊 Analytics feature requested');
        // Create a more attractive modal-style notification
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease-out;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            padding: 32px;
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 400px;
            text-align: center;
            transform: scale(0.8);
            transition: transform 0.3s ease-out;
        `;
        
        content.innerHTML = `
            <div style="font-size: 64px; margin-bottom: 16px;">📊</div>
            <h3 style="color: #8B4789; font-size: 24px; font-weight: bold; margin-bottom: 16px;">Analytics Coming Soon!</h3>
            <p style="color: #666; margin-bottom: 24px; line-height: 1.5;">
                We're working on detailed analytics that will show:
                <br><br>
                📈 Sales trends and revenue<br>
                🏆 Popular products<br>
                � Customere insights<br>
                📊 Performance metrics
            </p>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: linear-gradient(135deg, #8B4789 0%, #E5498D 100%); 
                           color: white; 
                           border: none; 
                           padding: 12px 24px; 
                           border-radius: 12px; 
                           font-weight: 500; 
                           cursor: pointer;
                           transition: transform 0.2s ease;">
                Got it! 🐾
            </button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        setTimeout(() => {
            modal.style.opacity = '1';
            content.style.transform = 'scale(1)';
        }, 100);
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.opacity = '0';
                content.style.transform = 'scale(0.8)';
                setTimeout(() => modal.remove(), 300);
            }
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64" style={{backgroundColor: '#FAFAF9'}}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{borderColor: '#8B4789'}}></div>
                    <p className="mt-4" style={{color: '#8B4789'}}>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Products',
            value: stats.totalProducts || 0,
            icon: '📦',
            bgColor: '#E5F2FF',
            progressColor: '#3B82F6'
        },
        {
            title: 'Pending Orders',
            value: stats.pendingOrders || 0,
            icon: '⏳',
            bgColor: '#FFE5D9',
            progressColor: '#F59E0B'
        },
        {
            title: 'Completed Orders',
            value: stats.completedOrders || 0,
            icon: '✅',
            bgColor: '#E8F8F5',
            progressColor: '#10B981'
        },
        {
            title: 'Total Sales',
            value: `₹${(stats.totalSales || 0).toFixed(2)}`,
            icon: '💰',
            bgColor: '#F5F3FF',
            progressColor: '#8B4789'
        }
    ];

    const getStatusBadge = (status) => {
        const statusConfig = {
            'PENDING': { bg: '#FFE5D9', text: '#F59E0B', label: 'Pending' },
            'CONFIRMED': { bg: '#E5F2FF', text: '#3B82F6', label: 'Confirmed' },
            'PROCESSING': { bg: '#FFE5D9', text: '#F59E0B', label: 'Processing' },
            'SHIPPED': { bg: '#E5F2FF', text: '#3B82F6', label: 'Shipped' },
            'DELIVERED': { bg: '#E8F8F5', text: '#10B981', label: 'Delivered' },
            'CANCELLED': { bg: '#FEE2E2', text: '#EF4444', label: 'Cancelled' }
        };
        
        const config = statusConfig[status] || statusConfig['PENDING'];
        return (
            <span 
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                style={{backgroundColor: config.bg, color: config.text}}
            >
                {config.label}
            </span>
        );
    };

    return (
        <div className="space-y-6" style={{backgroundColor: '#FAFAF9', minHeight: '100vh', padding: '1.5rem'}}>
            {/* Welcome Message with Paw Prints */}
            <div 
                className="rounded-2xl p-8 text-white relative overflow-hidden"
                style={{background: 'linear-gradient(135deg, #FFE5F0 0%, #FFDDD2 100%)'}}
            >
                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <h2 className="text-3xl font-bold mb-2" style={{color: '#8B4789'}}>
                            Welcome back, {vendor?.contactName}! 🐾
                        </h2>
                        <p style={{color: '#8B4789', opacity: 0.8}}>
                            Here's what's happening with your pet store today
                        </p>
                    </div>
                    <div className="text-6xl opacity-20">
                        🏪
                    </div>
                </div>
                {/* Paw print decorations */}
                <div className="absolute top-4 right-4 opacity-20" style={{color: '#8B4789'}}>
                    <span className="text-4xl">🐾</span>
                </div>
                <div className="absolute bottom-4 right-12 opacity-15" style={{color: '#8B4789'}}>
                    <span className="text-3xl">🐾</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => (
                    <div 
                        key={index} 
                        className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all duration-200 border"
                        style={{borderColor: '#E9D5FF'}}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div 
                                className="w-12 h-12 rounded-full flex items-center justify-center"
                                style={{backgroundColor: card.bgColor}}
                            >
                                <span className="text-2xl">{card.icon}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold" style={{color: '#8B4789'}}>{card.value}</p>
                                <p className="text-sm text-gray-600">{card.title}</p>
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div 
                                className="h-2 rounded-full transition-all duration-500"
                                style={{
                                    backgroundColor: card.progressColor,
                                    width: `${Math.min((card.value / 100) * 100, 100)}%`
                                }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm border" style={{borderColor: '#E9D5FF'}}>
                <div className="p-6 border-b" style={{borderColor: '#E9D5FF'}}>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold" style={{color: '#8B4789'}}>Recent Orders</h3>
                        <span className="text-2xl">📋</span>
                    </div>
                </div>
                
                <div className="p-6">
                    {recentOrders.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-6xl mb-4">📦</div>
                            <p className="text-gray-500">No orders yet</p>
                            <p className="text-sm text-gray-400 mt-1">Orders will appear here once customers start purchasing your pet products</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentOrders.map((order) => (
                                <div 
                                    key={order.orderId} 
                                    className="flex items-center justify-between p-4 rounded-2xl hover:shadow-sm transition-all duration-200"
                                    style={{backgroundColor: '#F5F3FF'}}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div 
                                            className="w-10 h-10 rounded-full flex items-center justify-center"
                                            style={{background: 'linear-gradient(135deg, #8B4789 0%, #E5498D 100%)'}}
                                        >
                                            <span className="text-white font-bold text-sm">
                                                {order.customerName?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium" style={{color: '#8B4789'}}>#{order.orderNumber}</p>
                                            <p className="text-sm text-gray-600">{order.customerName}</p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                {order.items?.map((item, idx) => (
                                                    <span key={idx} className="text-xs text-gray-500">
                                                        {item.productName} (x{item.quantity})
                                                        {idx < order.items.length - 1 && ', '}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold" style={{color: '#8B4789'}}>₹{order.totalAmount?.toFixed(2)}</p>
                                        <div className="mt-1">
                                            {getStatusBadge(order.orderStatus)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div 
                    className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group border"
                    style={{borderColor: '#E9D5FF'}}
                    onClick={handleAddProduct}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(139, 71, 137, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                    }}
                >
                    <div className="text-center">
                        <div 
                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                            style={{backgroundColor: '#E5F2FF'}}
                        >
                            <span className="text-3xl">📦</span>
                        </div>
                        <h4 className="font-semibold mb-2 group-hover:text-purple-600 transition-colors duration-300" style={{color: '#8B4789'}}>Add New Product</h4>
                        <p className="text-sm text-gray-600 mb-4">Add a new pet product to your inventory</p>
                        <button 
                            className="w-full py-2 px-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            style={{backgroundColor: '#8B4789', color: 'white'}}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAddProduct();
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'linear-gradient(135deg, #8B4789 0%, #E5498D 100%)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = '#8B4789';
                            }}
                        >
                            Add Product
                        </button>
                    </div>
                </div>

                <div 
                    className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group border"
                    style={{borderColor: '#E9D5FF'}}
                    onClick={handleManageOrders}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                    }}
                >
                    <div className="text-center">
                        <div 
                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                            style={{backgroundColor: '#E8F8F5'}}
                        >
                            <span className="text-3xl">📋</span>
                        </div>
                        <h4 className="font-semibold mb-2 group-hover:text-green-600 transition-colors duration-300" style={{color: '#8B4789'}}>Manage Orders</h4>
                        <p className="text-sm text-gray-600 mb-4">Update order status and track shipments</p>
                        <button 
                            className="w-full py-2 px-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            style={{backgroundColor: '#10B981', color: 'white'}}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleManageOrders();
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = '#10B981';
                            }}
                        >
                            View Orders
                        </button>
                    </div>
                </div>

                <div 
                    className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group border"
                    style={{borderColor: '#E9D5FF'}}
                    onClick={handleViewAnalytics}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(229, 73, 141, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                    }}
                >
                    <div className="text-center">
                        <div 
                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                            style={{backgroundColor: '#F5F3FF'}}
                        >
                            <span className="text-3xl">📊</span>
                        </div>
                        <h4 className="font-semibold mb-2 group-hover:text-pink-600 transition-colors duration-300" style={{color: '#8B4789'}}>View Analytics</h4>
                        <p className="text-sm text-gray-600 mb-4">Track your sales and performance</p>
                        <button 
                            className="w-full py-2 px-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            style={{backgroundColor: '#E5498D', color: 'white'}}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleViewAnalytics();
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'linear-gradient(135deg, #E5498D 0%, #8B4789 100%)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = '#E5498D';
                            }}
                        >
                            View Reports
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboardHome;