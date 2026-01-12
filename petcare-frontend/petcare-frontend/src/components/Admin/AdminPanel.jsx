import React, { useState, useEffect } from 'react';
import Navbar from '../Layout/Navbar';
import { 
  FaUsers, FaBox, FaDollarSign, FaChartLine, 
  FaEye, FaEdit, FaTrash, FaCheck, FaTimes,
  FaShoppingCart, FaClock, FaCheckCircle, FaBan
} from 'react-icons/fa';
import adminService from '../../services/adminService';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, productsData, ordersData] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getAllProducts(),
        adminService.getAllOrders()
      ]);
      
      setStats(statsData);
      setProducts(productsData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductStatusUpdate = async (productId, isActive) => {
    try {
      await adminService.updateProductStatus(productId, isActive);
      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Failed to update product status:', error);
      alert('Failed to update product status');
    }
  };

  const handleOrderStatusUpdate = async (orderId, status) => {
    try {
      await adminService.updateOrderStatus(orderId, status);
      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status');
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`text-2xl ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={stats.totalProducts || 0}
          icon={<FaBox />}
          color="text-blue-600"
          subtitle={`${stats.activeProducts || 0} active`}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders || 0}
          icon={<FaShoppingCart />}
          color="text-green-600"
          subtitle={`${stats.pendingOrders || 0} pending`}
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue || 0}`}
          icon={<FaDollarSign />}
          color="text-yellow-600"
          subtitle={`$${stats.monthlyRevenue || 0} this month`}
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers || 0}
          icon={<FaUsers />}
          color="text-purple-600"
          subtitle={`${stats.totalVets || 0} vets, ${stats.totalVendors || 0} vendors`}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Active Products</span>
              <span className="font-semibold text-green-600">{stats.activeProducts || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Inactive Products</span>
              <span className="font-semibold text-red-600">{stats.inactiveProducts || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Low Stock</span>
              <span className="font-semibold text-orange-600">{stats.lowStockProducts || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Pending</span>
              <span className="font-semibold text-orange-600">{stats.pendingOrders || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed</span>
              <span className="font-semibold text-green-600">{stats.completedOrders || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cancelled</span>
              <span className="font-semibold text-red-600">{stats.cancelledOrders || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointments</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total</span>
              <span className="font-semibold text-blue-600">{stats.totalAppointments || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Upcoming</span>
              <span className="font-semibold text-green-600">{stats.upcomingAppointments || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Today</span>
              <span className="font-semibold text-orange-600">{stats.todayAppointments || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Product Management</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <img
                      src={product.imageUrl || '/api/placeholder/50/50'}
                      alt={product.title}
                      className="w-10 h-10 object-cover rounded-lg mr-3"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.title}</div>
                      <div className="text-sm text-gray-500">{product.brand}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {product.vendor?.name || 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">${product.price}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    product.stockQuantity > 10 
                      ? 'bg-green-100 text-green-800'
                      : product.stockQuantity > 0
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stockQuantity}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    product.isActive 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleProductStatusUpdate(product.id, !product.isActive)}
                      className={`p-2 rounded-lg ${
                        product.isActive 
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={product.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {product.isActive ? <FaTimes size={14} /> : <FaCheck size={14} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Order Management</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{order.user?.name || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-gray-900">${order.totalAmount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={order.status}
                    onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-2 py-1"
                  >
                    <option value="PLACED">Placed</option>
                    <option value="PAID">Paid</option>
                    <option value="PACKED">Packed</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              🛡️ Admin Panel
            </h1>
            <p className="text-gray-600 mt-1">Manage products, orders, and system overview</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-white rounded-xl p-1 mb-8 shadow-lg">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <FaChartLine /> },
              { id: 'products', label: 'Products', icon: <FaBox /> },
              { id: 'orders', label: 'Orders', icon: <FaShoppingCart /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'products' && renderProducts()}
              {activeTab === 'orders' && renderOrders()}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminPanel;