'use client';
import React, { useState, useEffect } from 'react';
import { PlusCircle, X, ChevronDown, Calendar, Users, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getBreedsForSpecies } from '../lib/breeds';

export default function DashboardHeader({ userName, userRole }: { userName: string, userRole: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const router = useRouter();

  const [formData, setFormData] = useState({ client_id: '', name: '', species: 'Dog', breed: '' });

  useEffect(() => {
    if (isOpen) {
      fetch('http://localhost:8000/clients/').then(r => r.json()).then(data => {
        setClients(data);
        if (data.length > 0) setFormData(prev => ({...prev, client_id: data[0].id}));
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/patients/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsOpen(false);
        setFormData({ client_id: '', name: '', species: 'Dog', breed: '' });
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {userRole === 'vet' ? 'Veterinarian' : userRole === 'reception' ? 'Receptionist' : 'Admin'} Dashboard
            </h2>
            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${userRole === 'vet' ? 'bg-indigo-100 text-indigo-700' : userRole === 'reception' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-800'}`}>
              {userRole}
            </span>
          </div>
          <p className="text-slate-500 font-medium">Welcome back, {userName}</p>
        </div>
        <div className="relative">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 text-lg rounded-xl font-bold shadow-md transition-all hover:-translate-y-0.5"
          >
            <PlusCircle className="w-6 h-6 mr-2" /> 
            Quick Actions 
            <ChevronDown className="w-5 h-5 ml-2" />
          </button>
          
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <button 
                  onClick={() => { setMenuOpen(false); setIsOpen(true); }}
                  className="w-full flex items-center px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                >
                  <Activity className="w-4 h-4 mr-3 text-indigo-500" /> New Patient
                </button>
                <button 
                  onClick={() => { setMenuOpen(false); router.push('/appointments'); }}
                  className="w-full flex items-center px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors border-t border-slate-50"
                >
                  <Calendar className="w-4 h-4 mr-3 text-indigo-500" /> Schedule Appointment
                </button>
                <button 
                  onClick={() => { setMenuOpen(false); router.push('/clients'); }}
                  className="w-full flex items-center px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors border-t border-slate-50"
                >
                  <Users className="w-4 h-4 mr-3 text-indigo-500" /> Register Client
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Quick Add Patient</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Pet Owner (Client)</label>
                <select required value={formData.client_id} onChange={e => setFormData({...formData, client_id: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="" disabled>Select a client...</option>
                  {clients.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pet Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Species</label>
                  <select value={formData.species} onChange={e => setFormData({...formData, species: e.target.value, breed: ''})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Reptile">Reptile</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Breed</label>
                  <select value={formData.breed} onChange={e => setFormData({...formData, breed: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">Select breed...</option>
                    {getBreedsForSpecies(formData.species).map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={loading || !formData.client_id} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
