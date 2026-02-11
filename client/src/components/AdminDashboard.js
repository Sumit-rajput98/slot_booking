import React, { useState, useEffect } from 'react';
import http from '../api/http';
import AdminLogin from './AdminLogin';
import AdminPanel from './AdminPanel';
import SlotManagement from './admin/SlotManagement';
import UserManagement from './admin/UserManagement';
import AuditLogs from './admin/AuditLogs';
import Analytics from './admin/Analytics';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  BarChart3, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const storedAdmin = localStorage.getItem('admin');
      
      if (token && storedAdmin) {
        // Verify token is still valid
        const response = await http.get('/auth/admin/verify');
        
        if (response.data.success) {
          setAdmin(JSON.parse(storedAdmin));
        } else {
          // Token invalid, clear storage
          localStorage.removeItem('adminToken');
          localStorage.removeItem('admin');
        }
      }
    } catch (error) {
      console.error('Error checking admin:', error);
      // Clear invalid session
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (loggedInAdmin) => {
    setAdmin(loggedInAdmin);
  };

  const handleLogout = async () => {
    try {
      await http.post('/auth/admin/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin');
      setAdmin(null);
      toast.success('Logged out successfully');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!admin) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <AdminLogin onLogin={handleLogin} />
      </div>
    );
  }

  const menuItems = [
    { id: 'bookings', label: 'Bookings', icon: LayoutDashboard },
    { id: 'slots', label: 'Slot Management', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users, adminOnly: true },
    { id: 'audit', label: 'Audit Logs', icon: FileText, adminOnly: true }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || admin.role === 'ADMIN'
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
              <p className="text-xs text-gray-500">{admin.username}</p>
              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full mt-1 inline-block">
                {admin.role}
              </span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:text-gray-900"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center ${sidebarOpen ? 'px-4' : 'px-2 justify-center'} py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <Icon className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${sidebarOpen ? 'px-4' : 'px-2 justify-center'} py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors`}
            title={!sidebarOpen ? 'Logout' : ''}
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {activeTab === 'bookings' && <AdminPanel />}
          {activeTab === 'slots' && <SlotManagement />}
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'audit' && <AuditLogs />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
