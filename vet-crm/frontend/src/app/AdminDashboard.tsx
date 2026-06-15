'use client';
import React from 'react';
import Link from 'next/link';
import { Calendar, Users, ChevronRight } from 'lucide-react';

export default function AdminDashboard({ patients, appointments }: { patients: any[], appointments: any[] }) {
  // Take top 5 for preview
  const recentAppointments = [...appointments].reverse().slice(0, 5);
  const recentPatients = [...patients].reverse().slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/clients" className="block bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl shadow-indigo-100/20 hover:scale-[1.02] hover:bg-white/80 transition-all cursor-pointer">
          <h3 className="text-slate-500 font-semibold mb-2 flex items-center">
            <Users className="w-4 h-4 mr-2" /> Total Patients Enrolled
          </h3>
          <p className="text-4xl font-extrabold text-slate-900">{patients.length}</p>
        </Link>
        <Link href="/appointments" className="block bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 p-6 shadow-xl shadow-indigo-100/20 hover:scale-[1.02] hover:bg-white/80 transition-all cursor-pointer">
          <h3 className="text-slate-500 font-semibold mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2" /> Total Appointments
          </h3>
          <p className="text-4xl font-extrabold text-slate-900">{appointments.length}</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Appointments Table */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 overflow-hidden flex flex-col">
          <Link href="/appointments" className="border-b border-white/40 bg-white/80 px-6 py-4 flex justify-between items-center hover:bg-white transition-colors group cursor-pointer">
            <h3 className="font-bold text-slate-800 flex items-center">
              <Calendar className="w-5 h-5 text-indigo-600 mr-2" />
              Recent Appointments
            </h3>
            <span className="text-sm font-medium text-indigo-600 flex items-center group-hover:translate-x-1 transition-transform">
              View Calendar <ChevronRight className="w-4 h-4 ml-1" />
            </span>
          </Link>
          <div className="divide-y divide-slate-100/50 bg-white/30 flex-grow">
            {recentAppointments.length > 0 ? recentAppointments.map((appt: any) => (
              <div key={appt.id} className="p-4 flex items-center justify-between hover:bg-white/60 transition-colors">
                <div>
                  <p className="font-semibold text-slate-900">{appt.patient?.name || 'Unknown Patient'}</p>
                  <p className="text-sm text-slate-500">{new Date(appt.start_time).toLocaleDateString()} at {new Date(appt.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {appt.type}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${appt.status === 'Checked In' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-800'}`}>{appt.status}</span>
              </div>
            )) : (
              <div className="p-6 text-center text-slate-500">No appointments found.</div>
            )}
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-indigo-100/20 overflow-hidden flex flex-col">
          <Link href="/clients" className="border-b border-white/40 bg-white/80 px-6 py-4 flex justify-between items-center hover:bg-white transition-colors group cursor-pointer">
            <h3 className="font-bold text-slate-800 flex items-center">
              <Users className="w-5 h-5 text-emerald-600 mr-2" />
              Recently Enrolled Patients
            </h3>
            <span className="text-sm font-medium text-emerald-600 flex items-center group-hover:translate-x-1 transition-transform">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </span>
          </Link>
          <div className="divide-y divide-slate-100/50 bg-white/30 flex-grow">
            {recentPatients.length > 0 ? recentPatients.map((pat: any) => (
              <Link href={`/clients/${pat.client_id}`} key={pat.id} className="block p-4 flex items-center justify-between hover:bg-white/80 transition-colors cursor-pointer group">
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">{pat.name}</p>
                  <p className="text-sm text-slate-500">{pat.species} {pat.breed ? `• ${pat.breed}` : ''}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
              </Link>
            )) : (
              <div className="p-6 text-center text-slate-500">No patients found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
