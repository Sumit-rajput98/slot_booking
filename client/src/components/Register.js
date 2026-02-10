import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Register({ onLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async e => {
    e.preventDefault();
    setError('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      setError(error.message);
      return;
    }

    if (!data.user) {
      setSuccess('Check your email to verify your account.');
      return;
    }

    await supabase.from('candidates').insert({
      id: data.user.id,
      full_name: name,
      role
    });

    onLogin(data.user);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Register</h2>

      <form onSubmit={handleRegister} className="space-y-3">
        <input
          className="w-full border p-2 rounded"
          placeholder="Full Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />

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

        <select
          className="w-full border p-2 rounded"
          value={role}
          onChange={e => setRole(e.target.value)}
        >
          <option value="">Select Role</option>
          <option value="ADMIN">ADMIN</option>
          <option value="JCO">JCO</option>
          <option value="CO">CO</option>
        </select>

        <button className="w-full bg-primary-600 text-white py-2 rounded">
          Register
        </button>
      </form>

      {error && <p className="text-red-600 mt-2">{error}</p>}
      {success && <p className="text-green-600 mt-2">{success}</p>}
    </div>
  );
}
