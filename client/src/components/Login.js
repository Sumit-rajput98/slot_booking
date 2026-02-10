import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Login({ onLogin, onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async e => {
    e.preventDefault();
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setError(error.message);
      return;
    }

    onLogin(data.user);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Login</h2>

      <form onSubmit={handleLogin} className="space-y-3">
        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          className="w-full border p-2 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button className="w-full bg-primary-600 text-white py-2 rounded">
          Login
        </button>
      </form>

      {error && <p className="text-red-600 mt-2">{error}</p>}

      <p className="text-sm mt-4 text-center">
        Don’t have an account?{' '}
        <button className="text-primary-600" onClick={onRegister}>
          Register
        </button>
      </p>
    </div>
  );
}
