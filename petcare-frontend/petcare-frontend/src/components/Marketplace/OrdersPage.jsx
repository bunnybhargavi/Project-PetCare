import React, { useState, useEffect } from 'react';
import Navbar from '../Layout/Navbar';
import { FaBox, FaTruck, FaCheckCircle, FaTimesCircle, FaEye, FaCreditCard, FaHome } from 'react-icons/fa';
import orderService from '../../services/orderService';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [selectedOrder, setSelectedOrder] = useState(null);

  const orderStatuses = [
    { value: 'ALL', label: 'All Orders', color: 'gray' },
    { value: 'SHIPPED', label: 'Shipped', color: 'purple' },
    { value: 'DELIVERED', label: 'Delivered', color: 'green' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'red' }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PLACED': return <FaBox className="text-blue-500" />;
      case 'PAID': return <FaCheckCircle className="text-green-500" />;
      case 'PACKED': return <FaBox className="text-yellow-500" />;
      case 'SHIPPED': return <FaTruck className="text-purple-500" />;
      case 'DELIVERED': return <FaCheckCircle className="text-green-600" />;
      case 'CANCELLED': return <FaTimesCircle className="text-red-500" />;
      default: return <FaBox className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PLACED': return 'blue';
      case 'PAID': return 'green';
      case 'PACKED': return 'yellow';
      case 'SHIPPED': return 'purple';
      case 'DELIVERED': return 'green';
      case 'CANCELLED': return 'red';
      default: return 'gray';
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getUserOrders();
      if (response && response.success && response.data) {
        setOrders(response.data.content || []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order =>
    selectedStatus === 'ALL' || order.status === selectedStatus
  );

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await orderService.cancelOrder(orderId);
        loadOrders(); // Reload orders
      } catch (error) {
        console.error('Failed to cancel order:', error);
        alert('Failed to cancel order. Please try again.');
      }
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/api/placeholder/100/100';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8080${imagePath}`;
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              📦 My Orders
            </h1>
            <p className="text-gray-600 mt-1">Track your pet supply orders</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Status Filter */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Status</h3>
            <div className="flex flex-wrap gap-2">
              {orderStatuses.map(status => (
                <button
                  key={status.value}
                  onClick={() => setSelectedStatus(status.value)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${selectedStatus === status.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow">
              <p className="text-6xl mb-4">📦</p>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Orders Found</h3>
              <p className="text-gray-500">You haven't placed any orders yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.id}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${getStatusColor(order.status)}-100 text-${getStatusColor(order.status)}-800`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          ₹{order.totalAmount}
                        </p>
                        {order.trackingNumber && (
                          <p className="text-sm text-gray-600">
                            Tracking: {order.trackingNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.items && order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                          <img
                            src={getImageUrl((item.product && item.product.images && item.product.images.length > 0) ? item.product.images[0] : null)}
                            alt={item.product ? item.product.title : 'Product'}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{item.product ? item.product.title : 'Product'}</h4>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              ₹{item.unitPrice}
                            </p>
                            <p className="text-sm text-gray-600">each</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Actions */}
                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FaEye size={16} />
                        View Details
                      </button>
                      {order.status === 'DELIVERED' && (
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          Reorder
                        </button>
                      )}
                      {['PLACED', 'PAID'].includes(order.status) && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Order Details #{selectedOrder.id}</h2>
                <button onClick={closeOrderDetails} className="text-gray-500 hover:text-gray-700">
                  <FaTimesCircle size={24} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Tracking Diagram */}
                <div className="bg-gray-50 p-6 rounded-xl overflow-x-auto">
                  <h3 className="font-semibold text-gray-900 mb-6">Order Tracking</h3>
                  <div className="flex items-center justify-between min-w-[500px] relative">
                    {/* Progress Line Background */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-0 -translate-y-1/2 rounded"></div>

                    {/* Progress Line Active - calculate width based on status */}
                    <div
                      className="absolute top-1/2 left-0 h-1 bg-green-500 -z-0 -translate-y-1/2 rounded transition-all duration-500"
                      style={{
                        width: selectedOrder.status === 'PLACED' ? '0%' :
                          selectedOrder.status === 'CONFIRMED' ? '25%' :
                            selectedOrder.status === 'PAID' ? '50%' :
                              selectedOrder.status === 'SHIPPED' ? '75%' :
                                selectedOrder.status === 'DELIVERED' ? '100%' : '0%'
                      }}
                    ></div>

                    {/* Steps */}
                    {[
                      { id: 'PLACED', label: 'Placed', icon: <FaBox /> },
                      { id: 'CONFIRMED', label: 'Confirmed', icon: <FaCheckCircle /> },
                      { id: 'PAID', label: 'Paid', icon: <FaCreditCard /> }, // Using FaCreditCard but need to import it or reuse available icons
                      { id: 'SHIPPED', label: 'Shipped', icon: <FaTruck /> },
                      { id: 'DELIVERED', label: 'Delivered', icon: <FaHome /> } // Need FaHome or reuse FaCheckCircle
                    ].map((step, index) => {
                      const stepOrder = ['PLACED', 'CONFIRMED', 'PAID', 'SHIPPED', 'DELIVERED'];
                      const currentStatusIndex = stepOrder.indexOf(selectedOrder.status);
                      const stepIndex = stepOrder.indexOf(step.id);
                      const isCompleted = stepIndex <= currentStatusIndex;
                      const isCurrent = stepIndex === currentStatusIndex;

                      return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${isCompleted ? 'bg-green-500 border-green-500 text-white' :
                            'bg-white border-gray-200 text-gray-400'
                            }`}>
                            {isCompleted ? (step.icon || <FaCheckCircle />) : (step.icon || <span className="w-3 h-3 bg-gray-300 rounded-full"></span>)}
                          </div>
                          <span className={`mt-2 text-sm font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2">Shipping Information</h3>
                    <p className="text-gray-600">{selectedOrder.shippingName}</p>
                    <p className="text-gray-600">{selectedOrder.shippingAddress}</p>
                    <p className="text-gray-600">{selectedOrder.shippingCity}, {selectedOrder.shippingState} {selectedOrder.shippingZipCode}</p>
                    <p className="text-gray-600">{selectedOrder.shippingPhone}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2">Payment Information</h3>
                    <p className="text-gray-600">Method: {selectedOrder.paymentMethod}</p>
                    <p className="text-gray-600">Status: <span className={`font-medium ${selectedOrder.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>{selectedOrder.paymentStatus}</span></p>
                    <p className="text-gray-600">Total: ₹{selectedOrder.totalAmount}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{selectedOrder.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>₹{selectedOrder.shippingCost}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span>₹{selectedOrder.tax}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t">
                      <span>Total</span>
                      <span>₹{selectedOrder.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t bg-gray-50 flex justify-end">
                <button
                  onClick={closeOrderDetails}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default OrdersPage;