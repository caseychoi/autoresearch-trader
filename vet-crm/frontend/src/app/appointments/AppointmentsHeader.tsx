'use client';
import React, { useState, useEffect } from 'react';
import { PlusCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AppointmentsHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const router = useRouter();

  const [formData, setFormData] = useState({ 
    patient_id: '', 
    start_time: new Date().toISOString().slice(0, 16), 
    end_time: new Date(Date.now() + 3600000).toISOString().slice(0, 16), 
    type: 'Checkup', 
    status: 'Scheduled' 
  });

  useEffect(() => {
    if (isOpen) {
      fetch('http://localhost:8000/patients/').then(r => r.json()).then(data => {
        setPatients(data);
        if (data.length > 0) setFormData(prev => ({...prev, patient_id: data[0].id}));
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/appointments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...formData, start_time: new Date(formData.start_time).toISOString(), end_time: new Date(formData.end_time).toISOString() })
      });
      if (res.ok) {
        setIsOpen(false);
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
          <h2 className="text-2xl font-bold text-slate-900">Appointments</h2>
          <p className="text-slate-500">Manage the clinic schedule.</p>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
        >
          <PlusCircle className="w-5 h-5 mr-2" /> New Appointment
        </button>
      </header>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Schedule Appointment</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Patient (Pet)</label>
                <select required value={formData.patient_id} onChange={e => setFormData({...formData, patient_id: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="" disabled>Select a patient...</option>
                  {patients.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.species})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                  <input type="datetime-local" required value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                  <input type="datetime-local" required value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="Checkup">Checkup</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Vaccination">Vaccination</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="Scheduled">Scheduled</option>
                    <option value="Checked In">Checked In</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={loading || !formData.patient_id} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
