'use client';
import React, { useState } from 'react';
import { Plus, PlusCircle, X, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getBreedsForSpecies } from '../../../lib/breeds';

export default function ClientDetailHeader({ client }: { client: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({ client_id: client.id, name: '', species: 'Dog', breed: '' });

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
        setFormData({ client_id: client.id, name: '', species: 'Dog', breed: '' });
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleDeleteClient = async () => {
    if (!confirm('Are you sure you want to delete this client? This will move them to the restoration center.')) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`http://localhost:8000/clients/${client.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/clients');
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
    setIsDeleting(false);
  };

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">{client.first_name} {client.last_name}</h2>
          <p className="text-slate-500">Client Profile</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleDeleteClient}
            disabled={isDeleting}
            className="flex items-center bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-4 py-2 rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5 mr-2" /> {isDeleting ? 'Deleting...' : 'Delete Client'}
          </button>
          <button 
            onClick={() => setIsOpen(true)}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Patient
          </button>
        </div>
      </header>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Add New Patient</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
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
