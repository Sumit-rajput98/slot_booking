import React, { useState } from 'react';
import { slotManagementAPI } from '../../api';
import { toast } from 'react-hot-toast';
import { Calendar, Save, X } from 'lucide-react';
import moment from 'moment';
import DatePicker from 'react-datepicker';

const BulkSlotConfiguration = ({ onClose, onSuccess }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(moment().add(7, 'days').toDate());
  const [config, setConfig] = useState({
    status: 'open',
    maxSlots: 1200,
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [previewDates, setPreviewDates] = useState([]);

  // Calculate preview dates
  React.useEffect(() => {
    if (startDate && endDate) {
      const dates = [];
      let current = moment(startDate);
      const end = moment(endDate);
      
      while (current.isSameOrBefore(end)) {
        dates.push(current.format('YYYY-MM-DD'));
        current.add(1, 'day');
      }
      
      setPreviewDates(dates);
    }
  }, [startDate, endDate]);

  const handleStatusChange = (status) => {
    // Don't modify maxSlots here - let backend calculate
    // Just update the status
    let maxSlots = config.maxSlots || 1200;
    
    // Only set to 0 for closed status
    if (status === 'closed') {
      maxSlots = 0;
    }
    
    setConfig({ ...config, status, maxSlots });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    if (moment(endDate).isBefore(startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    if (previewDates.length > 365) {
      toast.error('Cannot configure more than 365 days at once');
      return;
    }

    setLoading(true);
    
    try {
      // Create configuration for each date
      const promises = previewDates.map(date => 
        slotManagementAPI.createSlotConfiguration({
          date,
          status: config.status,
          maxSlots: config.maxSlots,
          reason: config.reason
        })
      );

      await Promise.all(promises);
      
      toast.success(`Successfully configured ${previewDates.length} dates!`);
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to configure dates';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getQuickDateRange = (type) => {
    const start = new Date();
    let end;
    
    switch (type) {
      case '1week':
        end = moment().add(1, 'week').toDate();
        break;
      case '2weeks':
        end = moment().add(2, 'weeks').toDate();
        break;
      case '1month':
        end = moment().add(1, 'month').toDate();
        break;
      case '3months':
        end = moment().add(3, 'months').toDate();
        break;
      default:
        end = moment().add(1, 'week').toDate();
    }
    
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center">
            <Calendar className="h-6 w-6 mr-2 text-primary-600" />
            Bulk Date Configuration
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quick Date Range Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Select
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => getQuickDateRange('1week')}
                className="btn-secondary text-sm py-2"
              >
                Next Week
              </button>
              <button
                type="button"
                onClick={() => getQuickDateRange('2weeks')}
                className="btn-secondary text-sm py-2"
              >
                Next 2 Weeks
              </button>
              <button
                type="button"
                onClick={() => getQuickDateRange('1month')}
                className="btn-secondary text-sm py-2"
              >
                Next Month
              </button>
              <button
                type="button"
                onClick={() => getQuickDateRange('3months')}
                className="btn-secondary text-sm py-2"
              >
                Next 3 Months
              </button>
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                dateFormat="yyyy-MM-dd"
                className="input-field w-full"
                minDate={new Date()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <DatePicker
                selected={endDate}
                onChange={setEndDate}
                dateFormat="yyyy-MM-dd"
                className="input-field w-full"
                minDate={startDate}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-1">
              Date Range Preview
            </p>
            <p className="text-sm text-blue-700">
              {moment(startDate).format('MMM D, YYYY')} to {moment(endDate).format('MMM D, YYYY')}
            </p>
            <p className="text-sm text-blue-700 font-semibold mt-1">
              Total: {previewDates.length} days
            </p>
          </div>

          {/* Configuration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={config.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="input-field"
              required
            >
              <option value="open">Open (Full Day)</option>
              <option value="half_day_pre">Half Day Pre (Morning)</option>
              <option value="half_day_post">Half Day Post (Afternoon)</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Slots
            </label>
            <input
              type="number"
              value={config.maxSlots}
              onChange={(e) => setConfig({ ...config, maxSlots: parseInt(e.target.value) })}
              className="input-field"
              required
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              {config.status === 'half_day_pre' || config.status === 'half_day_post' 
                ? `Half day: ${Math.floor(config.maxSlots / 2)} slots will be available (50% of ${config.maxSlots})`
                : config.status === 'closed'
                ? 'Closed: No bookings allowed'
                : `Full day: ${config.maxSlots} slots`
              }
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (Optional)
            </label>
            <textarea
              value={config.reason}
              onChange={(e) => setConfig({ ...config, reason: e.target.value })}
              className="input-field"
              rows="3"
              placeholder="e.g., Holiday Season, Maintenance Period, etc."
            />
          </div>

          {/* Summary */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm font-medium text-yellow-900 mb-2">
              Configuration Summary
            </p>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Dates: {previewDates.length} days</li>
              <li>• Status: {config.status.replace('_', ' ').toUpperCase()}</li>
              <li>• Input Max Slots: {config.maxSlots} per day</li>
              {(config.status === 'half_day_pre' || config.status === 'half_day_post') && (
                <li>• Actual Slots: {Math.floor(config.maxSlots / 2)} per day (50% for half day)</li>
              )}
              <li>• Total Capacity: {previewDates.length * (
                (config.status === 'half_day_pre' || config.status === 'half_day_post') 
                  ? Math.floor(config.maxSlots / 2) 
                  : config.maxSlots
              )} slots</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || previewDates.length === 0}
              className="btn-primary flex-1 flex items-center justify-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Configuring...' : `Configure ${previewDates.length} Dates`}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkSlotConfiguration;
