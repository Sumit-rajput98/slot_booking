import React, { useState, useEffect } from 'react';
import { slotManagementAPI } from '../../api';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, Plus, Edit2, Trash2, Save, X, CalendarRange } from 'lucide-react';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import BulkSlotConfiguration from './BulkSlotConfiguration';

const SlotManagement = () => {
  const [configurations, setConfigurations] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [startDate, setStartDate] = useState(moment().toDate());
  const [endDate, setEndDate] = useState(moment().add(30, 'days').toDate());

  const [formData, setFormData] = useState({
    date: moment().format('YYYY-MM-DD'),
    status: 'open',
    maxSlots: 1200,
    reason: ''
  });

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const start = moment(startDate).format('YYYY-MM-DD');
      const end = moment(endDate).format('YYYY-MM-DD');

      const [configsRes, availRes] = await Promise.all([
        slotManagementAPI.getSlotConfigurations(start, end),
        slotManagementAPI.getSlotAvailability(start, end)
      ]);

      setConfigurations(configsRes.data);
      setAvailability(availRes.data);
    } catch (error) {
      toast.error('Failed to fetch slot data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingConfig) {
        await slotManagementAPI.updateSlotConfiguration(editingConfig.id, formData);
        toast.success('Slot configuration updated');
      } else {
        await slotManagementAPI.createSlotConfiguration(formData);
        toast.success('Slot configuration created');
      }
      
      setShowAddModal(false);
      setEditingConfig(null);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save configuration');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this configuration?')) {
      return;
    }

    try {
      await slotManagementAPI.deleteSlotConfiguration(id);
      toast.success('Configuration deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete configuration');
    }
  };

  const handleEdit = (config) => {
    setEditingConfig(config);
    setFormData({
      date: config.date,
      status: config.status,
      maxSlots: config.max_slots,
      reason: config.reason || ''
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      date: moment().format('YYYY-MM-DD'),
      status: 'open',
      maxSlots: 1200,
      reason: ''
    });
  };

  const handleStatusChange = (status) => {
    // Don't modify maxSlots here - let backend calculate
    // Just update the status
    let maxSlots = formData.maxSlots || 1200;
    
    // Only set to 0 for closed status
    if (status === 'closed') {
      maxSlots = 0;
    }
    
    setFormData({ ...formData, status, maxSlots });
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: 'bg-green-100 text-green-800',
      half_day_pre: 'bg-yellow-100 text-yellow-800',
      half_day_post: 'bg-orange-100 text-orange-800',
      closed: 'bg-red-100 text-red-800'
    };
    const labels = {
      open: 'Open',
      half_day_pre: 'Half Day (Pre)',
      half_day_post: 'Half Day (Post)',
      closed: 'Closed'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Slot Management</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkModal(true)}
            className="btn-secondary flex items-center"
          >
            <CalendarRange className="h-4 w-4 mr-2" />
            Bulk Configure
          </button>
          <button
            onClick={() => {
              resetForm();
              setEditingConfig(null);
              setShowAddModal(true);
            }}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Single Date
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={setStartDate}
              dateFormat="yyyy-MM-dd"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={setEndDate}
              dateFormat="yyyy-MM-dd"
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Availability Calendar View */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Slot Availability Overview</h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availability.map((day) => (
              <div
                key={day.date}
                className={`p-4 rounded-lg border-2 ${
                  day.status === 'closed'
                    ? 'border-red-300 bg-red-50'
                    : day.status === 'half_day_pre' || day.status === 'half_day_post'
                    ? 'border-yellow-300 bg-yellow-50'
                    : day.availableSlots === 0
                    ? 'border-orange-300 bg-orange-50'
                    : 'border-green-300 bg-green-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">
                    {moment(day.date).format('MMM D, YYYY')}
                  </span>
                  {getStatusBadge(day.status)}
                </div>
                <div className="text-sm text-gray-600">
                  <div>Max: {day.maxSlots} slots</div>
                  <div>Booked: {day.bookedSlots}</div>
                  <div className="font-semibold text-gray-900">
                    Available: {day.availableSlots}
                  </div>
                  {day.reason && (
                    <div className="mt-2 text-xs italic text-gray-500">
                      {day.reason}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Configurations Table */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Slot Configurations</h3>
        {configurations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Slots</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {configurations.map((config) => (
                  <tr key={config.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {moment(config.date).format('MMM D, YYYY')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(config.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {config.max_slots}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {config.reason || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEdit(config)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(config.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No configurations found</p>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingConfig ? 'Edit Configuration' : 'Add Configuration'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingConfig(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="open">Open (Full Day)</option>
                  <option value="half_day_pre">Half Day Pre (Morning)</option>
                  <option value="half_day_post">Half Day Post (Afternoon)</option>
                  <option value="closed">Closed (0 slots)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Half day will be 50% of max slots
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Slots</label>
                <input
                  type="number"
                  value={formData.maxSlots}
                  onChange={(e) => setFormData({ ...formData, maxSlots: parseInt(e.target.value) })}
                  className="input-field"
                  required
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.status === 'half_day_pre' || formData.status === 'half_day_post' 
                    ? `Half day: ${Math.floor(formData.maxSlots / 2)} slots will be available (50% of ${formData.maxSlots})`
                    : formData.status === 'closed'
                    ? 'Closed: No bookings allowed'
                    : `Full day: ${formData.maxSlots} slots`
                  }
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="e.g., Public Holiday, Maintenance, etc."
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center">
                  <Save className="h-4 w-4 mr-2" />
                  {editingConfig ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingConfig(null);
                    resetForm();
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Configuration Modal */}
      {showBulkModal && (
        <BulkSlotConfiguration
          onClose={() => setShowBulkModal(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
};

export default SlotManagement;
