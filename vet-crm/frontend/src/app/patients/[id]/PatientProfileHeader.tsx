'use client';
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PatientProfileHeader({ patient }: { patient: any }) {
  return (
    <header className="mb-8">
      <Link href="/clients" className="inline-flex items-center text-slate-500 hover:text-slate-700 font-medium mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Clients & Patients
      </Link>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">{patient.name}</h2>
          <p className="text-slate-500">{patient.species} • {patient.breed || 'Unknown breed'}</p>
        </div>
      </div>
    </header>
  );
}
