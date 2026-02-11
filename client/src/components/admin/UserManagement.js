import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { toast } from 'react-hot-toast';
import { Users, Search, Shield, Trash2, RefreshCw } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, [roleFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        adminAPI.getAllUsers(roleFilter, searchTerm),
        adminAPI.getUserStats()
      ]);
      setUsers(usersRes.data.users);
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      await adminAPI.updateUserRole(userId, newRole);
      toast.success('User role updated');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete user');
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      ADMIN: 'bg-purple-100 text-purple-800',
      JCO: 'bg-blue-100 text-blue-800',
      CO: 'bg-green-100 text-green-800',
      USER: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[role] || badges.USER}`}>
        {role || 'USER'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button onClick={fetchData} className="btn-secondary flex items-center">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="card">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div>
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-purple-600">{stats.byRole.ADMIN}</p>
            </div>
          </div>
          <div className="card">
            <div>
              <p className="text-sm text-gray-600">JCOs</p>
              <p className="text-2xl font-bold text-blue-600">{stats.byRole.JCO}</p>
            </div>
          </div>
          <div className="card">
            <div>
              <p className="text-sm text-gray-600">COs</p>
              <p className="text-2xl font-bold text-green-600">{stats.byRole.CO}</p>
            </div>
          </div>
          <div className="card">
            <div>
              <p className="text-sm text-gray-600">Users</p>
              <p className="text-2xl font-bold text-gray-600">{stats.byRole.USER}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-center">
              <Search className="h-5 w-5 text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field flex-1"
              />
            </div>
          </div>
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="JCO">JCO</option>
              <option value="CO">CO</option>
              <option value="USER">User</option>
            </select>
          </div>
          <button onClick={fetchData} className="btn-primary">
            Search
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Users</h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role || 'USER'}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="USER">User</option>
                        <option value="CO">CO</option>
                        <option value="JCO">JCO</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDeleteUser(user.id, user.full_name)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete User"
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
          <p className="text-gray-500 text-center py-4">No users found</p>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
