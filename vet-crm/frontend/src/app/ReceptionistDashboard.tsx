import React from 'react';
import Link from 'next/link';

export default function ReceptionistDashboard({ patients, appointments }: { patients: any[], appointments: any[] }) {
  const scheduled = appointments.filter(a => a.status === 'Scheduled');
  const checkedIn = appointments.filter(a => a.status === 'Checked In');

  return (
    <div>
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl shadow-indigo-100/20 hover:scale-[1.02] transition-transform">
          <h3 className="text-slate-500 text-sm font-medium mb-1">Total Patients Enrolled</h3>
          <p className="text-3xl font-bold text-slate-900">{patients.length}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50/80 to-amber-100/50 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl shadow-orange-100/40 hover:scale-[1.02] transition-transform">
          <h3 className="text-orange-600 text-sm font-medium mb-1">Waiting in Lobby (Checked In)</h3>
          <p className="text-3xl font-bold text-orange-700">{checkedIn.length}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-50/80 to-cyan-50/80 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl shadow-cyan-100/40 hover:scale-[1.02] transition-transform">
          <h3 className="text-blue-600 text-sm font-medium mb-1">Upcoming Scheduled</h3>
          <p className="text-3xl font-bold text-blue-700">{scheduled.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 overflow-hidden">
          <div className="border-b border-white/40 bg-white/40 px-6 py-4 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Today's Appointments</h3>
            <Link href="/appointments" className="text-sm text-blue-600 hover:underline">View Calendar</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {appointments.length > 0 ? appointments.map((appt: any) => (
              <div key={appt.id} className="p-4 flex items-center justify-between hover:bg-white/50 transition-colors">
                <div>
                  <p className="font-medium text-slate-900">{appt.patient.name}</p>
                  <p className="text-sm text-slate-500">{new Date(appt.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {appt.type}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${appt.status === 'Checked In' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-800'}`}>{appt.status}</span>
              </div>
            )) : (
              <div className="p-4 text-slate-500">No appointments today.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
