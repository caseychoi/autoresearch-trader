'use client';
import React, { useState } from 'react';
import { Plus, X, Stethoscope } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PatientSOAPNotes({ patientId, records }: { patientId: string, records: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({ 
    patient_id: patientId,
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/records/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsOpen(false);
        setFormData({ patient_id: patientId, subjective: '', objective: '', assessment: '', plan: '' });
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h3 className="font-bold text-slate-900 flex items-center">
          <Stethoscope className="w-5 h-5 mr-2 text-slate-500" />
          Medical Records (SOAP Notes)
        </h3>
        <button 
          onClick={() => setIsOpen(true)}
          className="text-sm font-medium bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 inline mr-1" /> Add Note
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {records.length > 0 ? records.map((record: any) => (
          <div key={record.id} className="p-6 hover:bg-slate-50">
            <div className="text-sm text-slate-500 mb-3">{new Date(record.created_at).toLocaleString()}</div>
            <div className="space-y-4">
              <div><strong className="text-slate-700 block text-sm">Subjective:</strong> <p className="text-slate-900 text-sm mt-1 whitespace-pre-wrap">{record.subjective}</p></div>
              <div><strong className="text-slate-700 block text-sm">Objective:</strong> <p className="text-slate-900 text-sm mt-1 whitespace-pre-wrap">{record.objective}</p></div>
              <div><strong className="text-slate-700 block text-sm">Assessment:</strong> <p className="text-slate-900 text-sm mt-1 whitespace-pre-wrap">{record.assessment}</p></div>
              <div><strong className="text-slate-700 block text-sm">Plan:</strong> <p className="text-slate-900 text-sm mt-1 whitespace-pre-wrap">{record.plan}</p></div>
            </div>
          </div>
        )) : (
          <div className="p-6 text-slate-500 text-center">No medical records found.</div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">New Clinical Note (SOAP)</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subjective (History & Owner's Report)</label>
                <textarea required rows={3} value={formData.subjective} onChange={e => setFormData({...formData, subjective: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Objective (Vitals & Physical Exam)</label>
                <textarea required rows={3} value={formData.objective} onChange={e => setFormData({...formData, objective: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assessment (Diagnosis)</label>
                <textarea required rows={2} value={formData.assessment} onChange={e => setFormData({...formData, assessment: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Plan (Treatment & Meds)</label>
                <textarea required rows={3} value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
