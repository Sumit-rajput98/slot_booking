import React, { useState } from 'react';
import BookingInterface from './components/BookingInterface';
import AdminDashboard from './components/AdminDashboard';
import ProfilePage from './components/ProfilePage';
import { Calendar, Settings, User } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('booking');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER - Only show for non-admin views */}
      {currentView !== 'admin' && (
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
              <button
                onClick={() => setCurrentView('booking')}
                className={`px-3 py-2 rounded text-sm hover:bg-gray-100 ${
                  currentView === 'booking' ? 'bg-gray-100 font-medium' : ''
                }`}
              >
                Book Slot
              </button>

              <button
                onClick={() => setCurrentView('profile')}
                className={`px-3 py-2 rounded text-sm flex items-center hover:bg-gray-100 ${
                  currentView === 'profile' ? 'bg-gray-100 font-medium' : ''
                }`}
              >
                <User className="h-4 w-4 mr-1" />
                Profile
              </button>

              <button
                onClick={() => setCurrentView('admin')}
                className={`px-3 py-2 rounded text-sm flex items-center hover:bg-gray-100 ${
                  currentView === 'admin' ? 'bg-gray-100 font-medium' : ''
                }`}
              >
                <Settings className="h-4 w-4 mr-1" />
                Admin
              </button>
            </nav>
          </div>
        </header>
      )}

      {/* MAIN */}
      {currentView === 'admin' ? (
        <AdminDashboard />
      ) : (
        <>
          <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
            {currentView === 'booking' && <BookingInterface />}
            {currentView === 'profile' && <ProfilePage />}
          </main>

          {/* FOOTER */}
          <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
            © 2024 SLOG SOLUTIONS. All rights reserved.
          </footer>
        </>
      )}
    </div>
  );
}

export default App;
