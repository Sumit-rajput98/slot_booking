import React, { useEffect, useState } from 'react';
import BookingInterface from './components/BookingInterface';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import Register from './components/Register';
import { Calendar, Settings, LogIn, UserPlus, LogOut } from 'lucide-react';
import { supabase } from './supabaseClient';

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  // Restore session on refresh
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        setUser(data.session.user);
        await loadProfile(data.session.user.id, data.session.user);
      }
    });
  }, []);

  const loadProfile = async (userId, userData) => {
    // Check if this is the designated admin email
    const userEmail = userData?.email;
    if (userEmail === 'slogsloutions.it@gmail.com') {
      setRole('ADMIN');
      setCurrentView('admin');
      return;
    }

    const { data } = await supabase
      .from('candidates')
      .select('role')
      .eq('id', userId)
      .single();

    setRole(data?.role);

    if (data?.role === 'ADMIN') {
      setCurrentView('admin');
    } else {
      setCurrentView('booking');
    }
  };

  const handleLogin = async (user) => {
    setUser(user);
    await loadProfile(user.id, user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setCurrentView('login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-primary-600 mr-2" />
            <div>
              <h1 className="text-lg font-bold">Slot Booking System</h1>
              <p className="text-xs text-gray-500">by SLOG SOLUTIONS</p>
            </div>
          </div>

          {/* NAV */}
          <nav className="flex space-x-2">
            {!user && (
              <>
                <button
                  onClick={() => setCurrentView('login')}
                  className="px-3 py-2 rounded text-sm flex items-center hover:bg-gray-100"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Login
                </button>

                <button
                  onClick={() => setCurrentView('register')}
                  className="px-3 py-2 rounded text-sm flex items-center hover:bg-gray-100"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Register
                </button>
              </>
            )}

            {user && (
              <>
                {role !== 'ADMIN' && (
                  <button
                    onClick={() => setCurrentView('booking')}
                    className="px-3 py-2 rounded text-sm hover:bg-gray-100"
                  >
                    Book Slot
                  </button>
                )}

                {role === 'ADMIN' && (
                  <button
                    onClick={() => setCurrentView('admin')}
                    className="px-3 py-2 rounded text-sm flex items-center hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Admin
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded text-sm flex items-center text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8">
        {!user && currentView === 'login' && (
          <Login onLogin={handleLogin} onRegister={() => setCurrentView('register')} />
        )}

        {!user && currentView === 'register' && (
          <Register onLogin={handleLogin} />
        )}

        {user && currentView === 'booking' && <BookingInterface />}

        {user && role === 'ADMIN' && currentView === 'admin' && <AdminPanel user={user} role={role} />}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
        © 2024 SLOG SOLUTIONS. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
