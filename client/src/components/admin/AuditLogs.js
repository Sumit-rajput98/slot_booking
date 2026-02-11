import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { toast } from 'react-hot-toast';
import { FileText, Download, RefreshCw, Filter } from 'lucide-react';
import DatePicker from 'react-datepicker';
import moment from 'moment';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    action: '',
    entityType: '',
    limit: 50,
    offset: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const formattedFilters = {
        ...filters,
        startDate: filters.startDate ? moment(filters.startDate).format('YYYY-MM-DD') : null,
        endDate: filters.endDate ? moment(filters.endDate).format('YYYY-MM-DD') : null
      };

      const [logsRes, statsRes] = await Promise.all([
        adminAPI.getAuditLogs(formattedFilters),
        adminAPI.getAuditStats(formattedFilters.startDate, formattedFilters.endDate)
      ]);

      setLogs(logsRes.data.logs);
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Failed to fetch audit logs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const startDate = filters.startDate ? moment(filters.startDate).format('YYYY-MM-DD') : null;
      const endDate = filters.endDate ? moment(filters.endDate).format('YYYY-MM-DD') : null;

      const response = await adminAPI.exportAuditLogs(startDate, endDate);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit_logs_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Audit logs exported successfully!');
    } catch (error) {
      toast.error('Failed to export audit logs');
    }
  };

  const getActionBadge = (action) => {
    const colors = {
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800',
      LOGIN: 'bg-purple-100 text-purple-800',
      LOGOUT: 'bg-gray-100 text-gray-800'
    };

    const actionType = action.split('_')[0];
    const colorClass = colors[actionType] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
        <div className="flex gap-2">
          <button onClick={fetchData} className="btn-secondary flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button onClick={handleExport} className="btn-primary flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Actions</p>
                <p className="text-2xl font-bold">{stats.totalActions}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div>
              <p className="text-sm text-gray-600 mb-2">Actions by Type</p>
              <div className="space-y-1">
                {Object.entries(stats.actionsByType).slice(0, 3).map(([action, count]) => (
                  <div key={action} className="flex justify-between text-sm">
                    <span className="text-gray-600">{action}:</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="card">
            <div>
              <p className="text-sm text-gray-600 mb-2">Actions by Entity</p>
              <div className="space-y-1">
                {Object.entries(stats.actionsByEntity).slice(0, 3).map(([entity, count]) => (
                  <div key={entity} className="flex justify-between text-sm">
                    <span className="text-gray-600">{entity}:</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Filter className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="font-semibold">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <DatePicker
              selected={filters.startDate}
              onChange={(date) => setFilters({ ...filters, startDate: date })}
              dateFormat="yyyy-MM-dd"
              className="input-field"
              placeholderText="Select start date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <DatePicker
              selected={filters.endDate}
              onChange={(date) => setFilters({ ...filters, endDate: date })}
              dateFormat="yyyy-MM-dd"
              className="input-field"
              placeholderText="Select end date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
            <select
              value={filters.entityType}
              onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="booking">Booking</option>
              <option value="slot_configuration">Slot Config</option>
              <option value="user">User</option>
              <option value="recurring_rule">Recurring Rule</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={fetchData} className="btn-primary w-full">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Activity Log</h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {moment(log.created_at).format('MMM D, YYYY HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.user_email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.entity_type} #{log.entity_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ip_address || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No audit logs found</p>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
