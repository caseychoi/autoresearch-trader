'use client';
import React, { useState, useEffect } from 'react';
import { Database, Download, RefreshCw, ArchiveRestore } from 'lucide-react';

export default function SystemDataTab() {
  const [backups, setBackups] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [deletedRecords, setDeletedRecords] = useState<{clients: any[], patients: any[]}>({clients: [], patients: []});

  useEffect(() => {
    fetchBackups();
    fetchDeleted();
  }, []);

  const fetchDeleted = async () => {
    try {
      const res = await fetch('http://localhost:8000/admin/deleted');
      if (res.ok) setDeletedRecords(await res.json());
    } catch (e) {}
  };

  const handleRestoreClient = async (id: string) => {
    await fetch(`http://localhost:8000/admin/restore/client/${id}`, { method: 'POST' });
    fetchDeleted();
  };

  const handleRestorePatient = async (id: string) => {
    await fetch(`http://localhost:8000/admin/restore/patient/${id}`, { method: 'POST' });
    fetchDeleted();
  };

  const handleRestoreDatabase = async (filename: string) => {
    if (!confirm(`Are you sure you want to restore the database from ${filename}? This will overwrite all current data.`)) return;
    try {
      const res = await fetch(`http://localhost:8000/admin/backup/restore/${filename}`, { method: 'POST' });
      if (res.ok) {
        alert('Database restored successfully! Please refresh the page to see the restored data.');
        window.location.reload();
      } else {
        alert('Failed to restore database.');
      }
    } catch (e) {
      alert('Error during restoration.');
    }
  };

  const fetchBackups = () => {
    fetch('http://localhost:8000/admin/backup/list')
      .then(res => res.json())
      .then(setBackups)
      .catch(console.error);
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      const res = await fetch('http://localhost:8000/admin/backup/create', { method: 'POST' });
      if (res.ok) {
        alert('Database backup created successfully!');
        fetchBackups();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create backup.');
    }
    setCreating(false);
  };

  const handleExportData = () => {
    window.open('http://localhost:8000/admin/export', '_blank');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-start">
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 mb-4">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Database Backup</h3>
          <p className="text-sm text-slate-500 mb-6 mt-1 flex-grow">Create a manual snapshot of your entire SQLite database. This ensures your clinic data is safely stored locally.</p>
          <button 
            onClick={handleCreateBackup} 
            disabled={creating}
            className="w-full flex justify-center items-center px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {creating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
            {creating ? 'Creating Snapshot...' : 'Create Snapshot'}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-start">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600 mb-4">
            <Download className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">JSON Data Export</h3>
          <p className="text-sm text-slate-500 mb-6 mt-1 flex-grow">Download all your records (Clients, Patients, Invoices, Appointments) in a portable JSON format.</p>
          <button 
            onClick={handleExportData}
            className="w-full flex justify-center items-center px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            Download JSON
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800">Local Backups</h3>
        </div>
        <table className="w-full text-left text-sm text-slate-600">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-6 py-3 font-medium">Filename</th>
              <th className="px-6 py-3 font-medium">Size (bytes)</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {backups.map((b, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-6 py-3 font-mono text-xs">{b.file}</td>
                <td className="px-6 py-3">{b.size.toLocaleString()}</td>
                <td className="px-6 py-3 text-right">
                  <button onClick={() => handleRestoreDatabase(b.file)} className="text-xs bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1.5 rounded-md font-bold transition-colors">
                    Restore DB
                  </button>
                </td>
              </tr>
            ))}
            {backups.length === 0 && (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-slate-500">No backups found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Restoration Center */}
      <div className="bg-rose-50/40 rounded-xl border border-rose-200/50 p-6 shadow-sm mt-8">
        <h2 className="text-xl font-bold text-rose-900 mb-6 flex items-center">
          <ArchiveRestore className="w-5 h-5 mr-3 text-rose-600" />
          Data Restoration Center (Soft Deletes)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold text-slate-800 mb-4 border-b border-rose-200/50 pb-2">Deleted Clients</h3>
            {deletedRecords.clients.length === 0 ? (
              <p className="text-slate-500 text-sm italic">No deleted clients.</p>
            ) : (
              <ul className="space-y-3">
                {deletedRecords.clients.map(c => (
                  <li key={c.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-rose-100 shadow-sm">
                    <span className="font-medium text-slate-700">{c.first_name} {c.last_name}</span>
                    <button onClick={() => handleRestoreClient(c.id)} className="text-xs bg-rose-100 text-rose-700 px-3 py-1.5 rounded-md font-bold hover:bg-rose-200 transition-colors">Restore</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 mb-4 border-b border-rose-200/50 pb-2">Deleted Patients</h3>
            {deletedRecords.patients.length === 0 ? (
              <p className="text-slate-500 text-sm italic">No deleted patients.</p>
            ) : (
              <ul className="space-y-3">
                {deletedRecords.patients.map(p => (
                  <li key={p.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-rose-100 shadow-sm">
                    <span className="font-medium text-slate-700">{p.name} ({p.species})</span>
                    <button onClick={() => handleRestorePatient(p.id)} className="text-xs bg-rose-100 text-rose-700 px-3 py-1.5 rounded-md font-bold hover:bg-rose-200 transition-colors">Restore</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
