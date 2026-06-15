'use client';
import React, { useState, useEffect } from 'react';

export default function GeneralProfileTab() {
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/settings/profile')
      .then(res => res.json())
      .then(setProfile);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('http://localhost:8000/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        alert('Profile saved successfully!');
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  if (!profile) return <div className="p-4 text-slate-500 animate-pulse">Loading profile...</div>;

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Clinic Name</label>
        <input type="text" value={profile.name || ''} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
        <input type="text" value={profile.address || ''} onChange={e => setProfile({...profile, address: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
          <input type="text" value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input type="email" value={profile.email || ''} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Default Tax Rate (%)</label>
        <input type="number" step="0.01" value={profile.tax_rate || 0} onChange={e => setProfile({...profile, tax_rate: parseFloat(e.target.value) || 0})} className="w-full md:w-1/3 border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
        <p className="text-xs text-slate-500 mt-1">This tax rate will be applied to all future invoices.</p>
      </div>
      <div className="pt-4 border-t border-slate-100">
        <button type="submit" disabled={saving} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 transition-colors">
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
}
