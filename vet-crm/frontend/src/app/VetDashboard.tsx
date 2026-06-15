import React from 'react';
import Link from 'next/link';

export default function VetDashboard({ patients, appointments }: { patients: any[], appointments: any[] }) {
  const checkedIn = appointments.filter(a => a.status === 'Checked In');

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Clinical Queue (Checked In)</h2>
        <div className="grid grid-cols-1 gap-4">
          {checkedIn.length > 0 ? checkedIn.map((appt: any) => (
            <div key={appt.id} className="bg-white/70 backdrop-blur-lg rounded-2xl border border-white/60 shadow-xl shadow-orange-100/30 p-6 flex justify-between items-center border-l-4 border-l-orange-500 hover:scale-[1.01] transition-transform">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{appt.patient.name}</h3>
                <p className="text-slate-500">{appt.patient.species} • {appt.type}</p>
                {appt.patient.alert_flags && <p className="text-sm font-semibold text-red-600 mt-2">Alert: {appt.patient.alert_flags}</p>}
              </div>
              <Link href={`/patients/${appt.patient.id}`} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Open Medical Chart
              </Link>
            </div>
          )) : (
            <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl p-8 text-center text-slate-600 shadow-sm">
              No patients are currently waiting in the lobby.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
