'use client';
import React, { useState } from 'react';
import { Plus, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ServiceCatalog({ initialServices }: { initialServices: any[] }) {
  const [services, setServices] = useState(initialServices);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', price: 0 });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/services/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const newService = await res.json();
        setServices([...services, newService]);
        setIsAdding(false);
        setFormData({ name: '', description: '', price: 0 });
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Service
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="mb-8 p-6 bg-indigo-50/50 rounded-xl border border-indigo-100 animate-in fade-in zoom-in duration-200">
          <h3 className="font-bold text-indigo-900 mb-4">Add New Service</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Service Name</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="e.g. Annual Checkup" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
              <input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="e.g. Includes full physical exam" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
              <input required type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Service'}
            </button>
          </div>
        </form>
      )}

      <div className="border border-slate-200 rounded-xl overflow-y-auto max-h-[600px]">
        <table className="w-full">
          <thead className="bg-slate-50 text-slate-600 text-sm font-bold uppercase tracking-wider text-left border-b border-slate-200 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-4">Service Name</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4 text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {services.map(s => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900 flex items-center">
                  <Tag className="w-4 h-4 mr-3 text-indigo-400" />
                  {s.name}
                </td>
                <td className="px-6 py-4 text-slate-500">{s.description || '-'}</td>
                <td className="px-6 py-4 text-right font-medium text-slate-900">${s.price.toFixed(2)}</td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-500">No services cataloged yet. Add your first service above!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
