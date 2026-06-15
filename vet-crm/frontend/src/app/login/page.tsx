'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        setError('Invalid email or password');
        return;
      }
      const data = await res.json();
      document.cookie = `auth_token=${data.access_token}; path=/; max-age=${60 * 60 * 24 * 7}`;
      document.cookie = `user_role=${data.user.role}; path=/; max-age=${60 * 60 * 24 * 7}`;
      document.cookie = `user_name=${data.user.name}; path=/; max-age=${60 * 60 * 24 * 7}`;
      router.push('/');
      router.refresh();
    } catch (err) {
      setError('Could not connect to server.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(135deg, #ddd6fe 0%, #bae6fd 50%, #a7f3d0 100%)' }}></div>
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-pulse pointer-events-none z-0" style={{ background: '#8b5cf6' }}></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full mix-blend-multiply filter blur-[120px] opacity-60 animate-pulse pointer-events-none z-0" style={{ background: '#0ea5e9' }}></div>

      <div className="relative z-10 bg-white/40 backdrop-blur-xl p-10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] w-full max-w-md border border-white/50">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-indigo-700 tracking-tight mb-2">🐾 VetPulse</h1>
          <p className="text-slate-600 font-medium">Please sign in to continue</p>
        </div>
        
        {error && <div className="mb-6 p-3 bg-red-100/80 backdrop-blur-md border border-red-200 text-red-700 rounded-xl text-sm font-medium">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
            <input 
              type="email" 
              required 
              className="w-full bg-white/60 border border-white/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder-slate-400"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="vet@clinic.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <input 
              type="password" 
              required 
              className="w-full bg-white/60 border border-white/50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder-slate-400"
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold text-lg rounded-xl px-4 py-3 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all">
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/40 text-sm text-slate-600 bg-white/20 rounded-xl p-4">
          <p className="font-bold text-indigo-900 mb-2">Test Accounts (Password: password123):</p>
          <ul className="space-y-1.5 font-medium">
            <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-indigo-400 mr-2"></span> vet@clinic.com</li>
            <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span> reception@clinic.com</li>
            <li className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-400 mr-2"></span> admin@clinic.com</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
