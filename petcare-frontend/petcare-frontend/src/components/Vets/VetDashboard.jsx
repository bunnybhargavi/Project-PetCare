import React, { useState, useEffect } from 'react';
import Navbar from '../Layout/Navbar';
import {
  FaCalendarAlt, FaCheckCircle, FaClock, FaVideo,
  FaClinicMedical, FaEdit, FaEye, FaUserMd, FaNotes,
  FaPrescriptionBottleAlt, FaCheck, FaTimes
} from 'react-icons/fa';
import vetDashboardService from '../../services/vetDashboardService';

const VetDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionData, setCompletionData] = useState({
    notes: '',
    prescription: ''
  });

  // Mock vet ID - in real app, get from auth context
  const vetId = 1;

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, upcomingAppointments, todayAppointments] = await Promise.all([
        vetDashboardService.getVetStats(vetId),
        vetDashboardService.getUpcomingAppointments(vetId),
        vetDashboardService.getTodayAppointments(vetId)
      ]);

      setStats(statsData);
      setAppointments([...todayAppointments, ...upcomingAppointments]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAppointment = async () => {
    try {
      await vetDashboardService.completeAppointment(selectedAppointment.id, completionData);
      setShowCompleteModal(false);
      setSelectedAppointment(null);
      setCompletionData({ notes: '', prescription: '' });
      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Failed to complete appointment:', error);
      alert('Failed to complete appointment');
    }
  };

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      await vetDashboardService.updateAppointmentStatus(appointmentId, { status });
      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Failed to update appointment status:', error);
      alert('Failed to update appointment status');
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

  const AppointmentCard = ({ appointment }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${appointment.type === 'TELECONSULT' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
            }`}>
            {appointment.type === 'TELECONSULT' ? <FaVideo size={16} /> : <FaClinicMedical size={16} />}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{appointment.pet?.name || 'Pet Name'}</h3>
            <p className="text-sm text-gray-600">{appointment.pet?.owner?.user?.name || 'Owner Name'}</p>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
            appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              appointment.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
          }`}>
          {appointment.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FaCalendarAlt size={14} />
          <span>{new Date(appointment.appointmentDate).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FaClock size={14} />
          <span>{appointment.durationMinutes || 30} minutes</span>
        </div>
        {appointment.reason && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <FaNotes size={14} className="mt-0.5" />
            <span>{appointment.reason}</span>
          </div>
        )}
      </div>

      {appointment.meetingLink && (
        <div className="mb-4">
          <a
            href={appointment.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <FaVideo size={14} />
            Join Video Call
          </a>
        </div>
      )}

      <div className="flex items-center gap-2 pt-4 border-t">
        {appointment.status === 'CONFIRMED' && (
          <>
            <button
              onClick={() => {
                setSelectedAppointment(appointment);
                setShowCompleteModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <FaCheckCircle size={14} />
              Complete
            </button>
            <button
              onClick={() => handleStatusUpdate(appointment.id, 'CANCELLED')}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <FaTimes size={14} />
              Cancel
            </button>
          </>
        )}
        {appointment.status === 'PENDING' && (
          <>
            <button
              onClick={() => handleStatusUpdate(appointment.id, 'CONFIRMED')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <FaCheck size={14} />
              Confirm
            </button>
            <button
              onClick={() => handleStatusUpdate(appointment.id, 'CANCELLED')}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <FaTimes size={14} />
              Decline
            </button>
          </>
        )}
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
          <FaEye size={14} />
          View Details
        </button>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Appointments"
          value={stats.totalAppointments || 0}
          icon={<FaCalendarAlt />}
          color="text-blue-600"
        />
        <StatCard
          title="Upcoming"
          value={stats.upcomingAppointments || 0}
          icon={<FaClock />}
          color="text-orange-600"
        />
        <StatCard
          title="Completed"
          value={stats.completedAppointments || 0}
          icon={<FaCheckCircle />}
          color="text-green-600"
        />
        <StatCard
          title="Today"
          value={stats.todayAppointments || 0}
          icon={<FaUserMd />}
          color="text-purple-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
            <FaCalendarAlt className="text-blue-600" size={20} />
            <div className="text-left">
              <div className="font-medium text-gray-900">Create Slot</div>
              <div className="text-sm text-gray-600">Add availability</div>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
            <FaNotes className="text-green-600" size={20} />
            <div className="text-left">
              <div className="font-medium text-gray-900">Patient Records</div>
              <div className="text-sm text-gray-600">View history</div>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
            <FaPrescriptionBottleAlt className="text-purple-600" size={20} />
            <div className="text-left">
              <div className="font-medium text-gray-900">Prescriptions</div>
              <div className="text-sm text-gray-600">Manage medications</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Appointments</h3>
        <div className="flex flex-wrap gap-2">
          {['All', 'Today', 'Upcoming', 'Completed', 'Pending'].map((filter) => (
            <button
              key={filter}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {appointments.map((appointment) => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))}
      </div>

      {appointments.length === 0 && (
        <div className="text-center py-12">
          <FaCalendarAlt className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
          <p className="text-gray-600">You don't have any appointments scheduled.</p>
        </div>
      )}
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
              🩺 Vet Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Manage appointments and patient consultations</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-white rounded-xl p-1 mb-8 shadow-lg">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <FaUserMd /> },
              { id: 'appointments', label: 'Appointments', icon: <FaCalendarAlt /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === tab.id
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
              {activeTab === 'appointments' && renderAppointments()}
            </>
          )}
        </div>

        {/* Complete Appointment Modal */}
        {showCompleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Complete Appointment</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consultation Notes
                  </label>
                  <textarea
                    rows={4}
                    value={completionData.notes}
                    onChange={(e) => setCompletionData({ ...completionData, notes: e.target.value })}
                    placeholder="Enter consultation notes, observations, and recommendations..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prescription
                  </label>
                  <textarea
                    rows={3}
                    value={completionData.prescription}
                    onChange={(e) => setCompletionData({ ...completionData, prescription: e.target.value })}
                    placeholder="Enter medications, dosage, and instructions..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleCompleteAppointment}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Complete Appointment
                  </button>
                  <button
                    onClick={() => {
                      setShowCompleteModal(false);
                      setSelectedAppointment(null);
                      setCompletionData({ notes: '', prescription: '' });
                    }}
                    className="flex-1 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default VetDashboard;