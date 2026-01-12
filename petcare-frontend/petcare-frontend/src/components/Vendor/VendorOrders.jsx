import React, { useState, useEffect } from 'react';
import { vendorService } from '../../services/vendorService';

const VendorOrders = ({ vendor }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await vendorService.getVendorOrders(vendor.id);
                if (response.success) {
                    setOrders(response.data);
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        if (vendor?.id) {
            fetchOrders();
        }
    }, [vendor]);

    const getStatusConfig = (status) => {
        const statusConfigs = {
            'PENDING': { 
                bg: '#FEF3C7', 
                text: '#92400E', 
                border: '#F59E0B',
                label: 'Pending',
                icon: '⏳'
            },
            'CONFIRMED': { 
                bg: '#DBEAFE', 
                text: '#1E40AF', 
                border: '#3B82F6',
                label: 'Confirmed',
                icon: '✅'
            },
            'PROCESSING': { 
                bg: '#FED7AA', 
                text: '#C2410C', 
                border: '#F97316',
                label: 'Processing',
                icon: '⚙️'
            },
            'SHIPPED': { 
                bg: '#E0E7FF', 
                text: '#3730A3', 
                border: '#6366F1',
                label: 'Shipped',
                icon: '🚚'
            },
            'DELIVERED': { 
                bg: '#D1FAE5', 
                text: '#065F46', 
                border: '#10B981',
                label: 'Delivered',
                icon: '📦'
            },
            'CANCELLED': { 
                bg: '#FEE2E2', 
                text: '#991B1B', 
                border: '#EF4444',
                label: 'Cancelled',
                icon: '❌'
            }
        };
        
        return statusConfigs[status] || statusConfigs['PENDING'];
    };

    const getStatusBadge = (status) => {
        const config = getStatusConfig(status);
        return (
            <span 
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold space-x-1"
                style={{
                    backgroundColor: config.bg,
                    color: config.text
                }}
            >
                <span>{config.icon}</span>
                <span>{config.label}</span>
            </span>
        );
    };

    const getNextStatuses = (currentStatus) => {
        const statusFlow = {
            'PENDING': ['CONFIRMED', 'PROCESSING'],
            'CONFIRMED': ['PROCESSING', 'SHIPPED'],
            'PROCESSING': ['SHIPPED'],
            'SHIPPED': ['DELIVERED']
        };
        return statusFlow[currentStatus] || [];
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            console.log('Updating order status:', { orderId, newStatus, vendorId: vendor?.id });
            
            if (!vendor?.id) {
                console.error('Vendor ID not available');
                showNotification('❌ Vendor information not available', 'error');
                return;
            }
            
            setLoading(true);
            const response = await vendorService.updateOrderStatus(vendor.id, orderId, newStatus);
            console.log('Update response:', response);
            
            if (response.success) {
                // Update the local orders state
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order.orderId === orderId 
                            ? { ...order, orderStatus: newStatus }
                            : order
                    )
                );
                showNotification(`✅ Order status updated to ${newStatus}!`, 'success');
            } else {
                showNotification(`❌ Failed to update status: ${response.message || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            showNotification(`❌ Failed to update order status: ${error.message || 'Network error'}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (message, type) => {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'};
            color: white;
            padding: 16px 24px;
            border-radius: 16px;
            box-shadow: 0 8px 32px ${type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
            z-index: 1000;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        return order.orderStatus === filter;
    });

    const filterOptions = [
        { value: 'all', label: 'All Orders', icon: '📋' },
        { value: 'PENDING', label: 'Pending', icon: '⏳' },
        { value: 'CONFIRMED', label: 'Confirmed', icon: '✅' },
        { value: 'PROCESSING', label: 'Processing', icon: '⚙️' },
        { value: 'SHIPPED', label: 'Shipped', icon: '🚚' },
        { value: 'DELIVERED', label: 'Delivered', icon: '📦' },
        { value: 'CANCELLED', label: 'Cancelled', icon: '❌' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64" style={{backgroundColor: '#FAFAF9'}}>
                <div className="text-center">
                    <div 
                        className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4"
                        style={{borderColor: '#7C3F8C'}}
                    ></div>
                    <p className="text-lg font-medium" style={{color: '#7C3F8C'}}>Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8" style={{backgroundColor: '#FAFAF9', minHeight: '100vh'}}>
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold mb-2" style={{color: '#7C3F8C'}}>
                        📋 Orders
                    </h2>
                    <p className="text-gray-600 text-lg">Manage and track your orders</p>
                </div>
                
                {/* Filter Pills */}
                <div className="flex flex-wrap gap-2">
                    {filterOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setFilter(option.value)}
                            className={`px-4 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-2 ${
                                filter === option.value
                                    ? 'text-white shadow-lg'
                                    : 'text-gray-600 bg-white border border-gray-200 hover:border-gray-300'
                            }`}
                            style={{
                                background: filter === option.value 
                                    ? 'linear-gradient(135deg, #7C3F8C 0%, #E91E63 100%)'
                                    : 'white',
                                boxShadow: filter === option.value 
                                    ? '0 4px 16px rgba(124, 63, 140, 0.3)'
                                    : '0 2px 8px rgba(0, 0, 0, 0.05)'
                            }}
                        >
                            <span>{option.icon}</span>
                            <span>{option.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center relative overflow-hidden">
                    {/* Paw print decoration */}
                    <div className="absolute top-8 right-8 opacity-10" style={{color: '#7C3F8C'}}>
                        <span className="text-6xl">🐾</span>
                    </div>
                    <div className="absolute bottom-8 left-8 opacity-10" style={{color: '#7C3F8C'}}>
                        <span className="text-4xl">🐾</span>
                    </div>
                    
                    <div 
                        className="text-9xl mb-6 animate-bounce"
                        style={{fontSize: '120px', lineHeight: '1'}}
                    >
                        📋
                    </div>
                    <h3 className="text-3xl font-bold mb-4" style={{color: '#7C3F8C', fontSize: '28px'}}>
                        No orders found
                    </h3>
                    <p className="text-gray-600 text-lg max-w-md mx-auto">
                        {filter === 'all' 
                            ? 'Orders will appear here once customers start purchasing your amazing products'
                            : `No orders with status "${filterOptions.find(f => f.value === filter)?.label}" found`
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredOrders.map((order) => {
                        const statusConfig = getStatusConfig(order.orderStatus);
                        return (
                            <div 
                                key={order.orderId} 
                                className="bg-white rounded-2xl shadow-lg border-l-4 overflow-hidden transition-all duration-200 hover:shadow-xl"
                                style={{
                                    borderLeftColor: statusConfig.border,
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(124, 63, 140, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                                }}
                            >
                                <div className="p-8">
                                    {/* Order Header */}
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                                        <div className="flex items-center space-x-4">
                                            <div 
                                                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
                                                style={{background: 'linear-gradient(135deg, #7C3F8C 0%, #E91E63 100%)'}}
                                            >
                                                {order.customerName?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">#{order.orderNumber}</h3>
                                                <p className="text-lg text-gray-700 font-medium">{order.customerName}</p>
                                                <p className="text-sm text-gray-500">{order.customerEmail}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                            <div className="text-right">
                                                <p 
                                                    className="text-3xl font-bold"
                                                    style={{color: '#7C3F8C'}}
                                                >
                                                    ₹{order.totalAmount?.toFixed(2)}
                                                </p>
                                                <p className="text-sm text-gray-500">Total Amount</p>
                                            </div>
                                            <div>
                                                {getStatusBadge(order.orderStatus)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="border-t border-gray-100 pt-6 mb-6">
                                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                            <span>📦</span>
                                            <span>Order Items:</span>
                                        </h4>
                                        <div className="space-y-3">
                                            {order.items?.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                                                            <span className="text-xl">📦</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{item.productName}</p>
                                                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-gray-900 text-lg">₹{item.totalPrice?.toFixed(2)}</p>
                                                        <p className="text-sm text-gray-600">₹{item.unitPrice?.toFixed(2)} each</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Order Actions */}
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between pt-6 border-t border-gray-100 gap-4">
                                        <div className="flex items-center space-x-3 text-gray-600">
                                            <span className="text-xl">💳</span>
                                            <span className="font-medium">Payment Status:</span>
                                            <span 
                                                className="px-3 py-1 rounded-full text-sm font-semibold"
                                                style={{
                                                    backgroundColor: order.paymentStatus === 'PAID' ? '#D1FAE5' : '#FEE2E2',
                                                    color: order.paymentStatus === 'PAID' ? '#065F46' : '#991B1B'
                                                }}
                                            >
                                                {order.paymentStatus}
                                            </span>
                                        </div>
                                        
                                        {getNextStatuses(order.orderStatus).length > 0 && (
                                            <div className="flex items-center space-x-4">
                                                <select 
                                                    id={`status-${order.orderId}`}
                                                    className="px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:border-transparent transition-all duration-200"
                                                    style={{focusRingColor: '#7C3F8C'}}
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>Select new status...</option>
                                                    {getNextStatuses(order.orderStatus).map(status => (
                                                        <option key={status} value={status}>
                                                            {getStatusConfig(status).label}
                                                        </option>
                                                    ))}
                                                    {/* Add option to cancel order if not already delivered */}
                                                    {order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && (
                                                        <option value="CANCELLED">
                                                            {getStatusConfig('CANCELLED').label}
                                                        </option>
                                                    )}
                                                </select>
                                                <button 
                                                    className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #7C3F8C 0%, #E91E63 100%)',
                                                        boxShadow: '0 4px 16px rgba(124, 63, 140, 0.3)'
                                                    }}
                                                    onClick={() => {
                                                        console.log('Update Status button clicked for order:', order.orderId);
                                                        const selectElement = document.getElementById(`status-${order.orderId}`);
                                                        const selectedStatus = selectElement.value;
                                                        console.log('Selected status:', selectedStatus, 'Current status:', order.orderStatus);
                                                        
                                                        if (selectedStatus !== order.orderStatus) {
                                                            console.log('Status changed, updating...');
                                                            updateOrderStatus(order.orderId, selectedStatus);
                                                        } else {
                                                            console.log('Status not changed, no update needed');
                                                            showNotification('⚠️ Please select a different status to update', 'error');
                                                        }
                                                    }}
                                                    disabled={loading}
                                                >
                                                    <span>🐾</span>
                                                    <span>{loading ? 'Updating...' : 'Update Status'}</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default VendorOrders;