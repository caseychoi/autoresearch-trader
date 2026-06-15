import React from 'react';
import AppointmentsHeader from './AppointmentsHeader';

async function getAppointments() {
  try {
    const res = await fetch('http://localhost:8000/appointments/', { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    return [];
  }
}

export default async function AppointmentsPage() {
  const appointments = await getAppointments();

  return (
    <main className="p-8">
      <AppointmentsHeader />
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-indigo-50 text-indigo-950 text-base font-bold text-left uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 border-b border-slate-200">Date & Time</th>
              <th className="px-6 py-4 border-b border-slate-200">Patient</th>
              <th className="px-6 py-4 border-b border-slate-200">Type</th>
              <th className="px-6 py-4 border-b border-slate-200">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {appointments.map((appt: any) => (
              <tr key={appt.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">
                  {new Date(appt.start_time).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-slate-900 font-medium">
                  {appt.patient?.name || 'Unknown'} <span className="text-slate-500 font-normal">({appt.patient?.species})</span>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {appt.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    appt.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    appt.status === 'Checked In' ? 'bg-orange-100 text-orange-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {appt.status}
                  </span>
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No appointments scheduled.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
