import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle, Trash2 } from 'lucide-react';
import { reminderService } from '../../services/reminderService';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

const DocumentsTab = ({ reminders, onRefresh, petId, onAddReminder }) => {
  const [viewMode, setViewMode] = useState('ALL');
  const [list, setList] = useState(reminders || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (viewMode === 'ALL') setList(reminders || []);
  }, [reminders, viewMode]);

  const loadMode = async (mode) => {
    if (mode === 'ALL') {
      setList(reminders || []);
      return;
    }
    setLoading(true);
    try {
      if (mode === 'PENDING') {
        const data = await reminderService.getPendingReminders(petId);
        setList(data);
      } else if (mode === 'UPCOMING') {
        const data = await reminderService.getUpcomingReminders(petId);
        setList(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    await reminderService.completeReminder(petId, id);
    await loadMode(viewMode);
    onRefresh();
  };

  const handleDelete = async (id) => {
    await reminderService.deleteReminder(petId, id);
    await loadMode(viewMode);
    onRefresh();
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Reminders</h3>
          <p className="text-sm text-gray-500">Vaccinations, check-ups, medications</p>
        </div>
        <button
          onClick={onAddReminder}
          className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg"
        >
          Add Reminder
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => { setViewMode('ALL'); loadMode('ALL'); }}
          className={`px-3 py-2 rounded-xl text-sm font-semibold ${viewMode === 'ALL' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          All
        </button>
        <button
          onClick={() => { setViewMode('PENDING'); loadMode('PENDING'); }}
          className={`px-3 py-2 rounded-xl text-sm font-semibold ${viewMode === 'PENDING' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Pending
        </button>
        <button
          onClick={() => { setViewMode('UPCOMING'); loadMode('UPCOMING'); }}
          className={`px-3 py-2 rounded-xl text-sm font-semibold ${viewMode === 'UPCOMING' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Upcoming
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No reminders.
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((reminder) => (
            <div
              key={reminder.id}
              className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <Bell className="text-yellow-600" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{reminder.title}</h4>
                  <p className="text-sm text-gray-500">
                    {reminder.type} • Due: {reminder.dueDate}
                    {reminder.isRecurring && reminder.repeatRule
                      ? ` • ${reminder.repeatRule.toLowerCase()}`
                      : ''}
                  </p>
                  {reminder.notes && (
                    <p className="text-xs text-gray-500 mt-1">{reminder.notes}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    statusColors[reminder.status] || 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {reminder.status}
                </span>
                {reminder.status === 'PENDING' && (
                  <button
                    onClick={() => handleComplete(reminder.id)}
                    className="p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100"
                    title="Mark complete"
                  >
                    <CheckCircle size={18} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(reminder.id)}
                  className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                  title="Delete reminder"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsTab;

