'use client';
import React, { useState, useEffect } from 'react';
import { Trash2, UserPlus } from 'lucide-react';

export default function StaffManagementTab() {
  const [staff, setStaff] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', role: 'vet' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = () => {
    fetch('http://localhost:8000/staff')
      .then(res => res.json())
      .then(setStaff);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff)
      });
      if (res.ok) {
        setIsAdding(false);
        setNewStaff({ name: '', email: '', role: 'vet' });
        fetchStaff();
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;
    try {
      const res = await fetch(`http://localhost:8000/staff/${id}`, { method: 'DELETE' });
      if (res.ok) fetchStaff();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Staff Members</h3>
          <p className="text-sm text-slate-500">Manage your clinic's veterinarians, technicians, and receptionists.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          <UserPlus className="w-4 h-4 mr-2" /> Add Staff
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-slate-50 border border-slate-200 p-6 rounded-xl space-y-4 max-w-2xl">
          <h4 className="font-bold text-slate-800">New Staff Member</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input required type="text" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input required type="email" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <select value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="vet">Veterinarian</option>
                <option value="tech">Technician</option>
                <option value="reception">Receptionist</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>
          <div className="pt-2 flex justify-end space-x-3">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">Save Member</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 text-slate-600 text-sm font-bold uppercase tracking-wider text-left border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staff.map(member => (
              <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{member.name}</td>
                <td className="px-6 py-4 text-slate-600">{member.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                    member.role === 'vet' ? 'bg-blue-100 text-blue-700' :
                    member.role === 'tech' ? 'bg-emerald-100 text-emerald-700' :
                    member.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(member.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors" title="Remove Staff">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {staff.length === 0 && !isAdding && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No staff members configured.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
