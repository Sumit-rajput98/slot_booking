import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { toast } from 'react-hot-toast';
import { BarChart3, TrendingUp, PieChart, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import moment from 'moment';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(moment().subtract(30, 'days').toDate());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const start = moment(startDate).format('YYYY-MM-DD');
      const end = moment(endDate).format('YYYY-MM-DD');

      const response = await adminAPI.getAnalytics(start, end);
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to fetch analytics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const topPurposes = Object.entries(analytics.byPurpose)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topLocations = Object.entries(analytics.byLocation)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topTimeSlots = Object.entries(analytics.byTimeSlot)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
      </div>

      {/* Date Range Filter */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
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
          <button onClick={fetchAnalytics} className="btn-primary">
            Update
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold">{analytics.totalBookings}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">{analytics.byStatus.confirmed}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <PieChart className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{analytics.byStatus.cancelled}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-purple-600">{analytics.byStatus.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Purposes */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Top Booking Purposes</h3>
          <div className="space-y-3">
            {topPurposes.map(([purpose, count]) => (
              <div key={purpose}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{purpose}</span>
                  <span className="font-semibold">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(count / analytics.totalBookings) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Locations */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Top Locations</h3>
          <div className="space-y-3">
            {topLocations.map(([location, count]) => (
              <div key={location}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{location}</span>
                  <span className="font-semibold">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(count / analytics.totalBookings) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Time Slots */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Popular Time Slots</h3>
          <div className="space-y-3">
            {topTimeSlots.map(([slot, count]) => (
              <div key={slot}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{slot}</span>
                  <span className="font-semibold">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${(count / analytics.totalBookings) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Status Breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Booking Status Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(analytics.byStatus).map(([status, count]) => (
              <div key={status}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 capitalize">{status}</span>
                  <span className="font-semibold">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      status === 'confirmed' ? 'bg-green-600' :
                      status === 'cancelled' ? 'bg-red-600' :
                      status === 'completed' ? 'bg-blue-600' :
                      'bg-gray-600'
                    }`}
                    style={{ width: `${(count / analytics.totalBookings) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Trend */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Daily Booking Trend</h3>
        <div className="overflow-x-auto">
          <div className="flex items-end space-x-2 min-w-max h-64">
            {Object.entries(analytics.dailyTrend)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, count]) => {
                const maxCount = Math.max(...Object.values(analytics.dailyTrend));
                const height = (count / maxCount) * 100;
                return (
                  <div key={date} className="flex flex-col items-center">
                    <div
                      className="w-12 bg-blue-600 rounded-t hover:bg-blue-700 transition-colors"
                      style={{ height: `${height}%` }}
                      title={`${count} bookings`}
                    ></div>
                    <span className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-top-left">
                      {moment(date).format('MMM D')}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
