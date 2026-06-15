import React from 'react';
import PatientProfileHeader from './PatientProfileHeader';
import PatientSOAPNotes from './PatientSOAPNotes';

async function getPatient(id: string) {
  try {
    const res = await fetch(`http://localhost:8000/patients/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    return null;
  }
}

async function getRecords(id: string) {
  try {
    const res = await fetch(`http://localhost:8000/patients/${id}/records`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    return [];
  }
}

export default async function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const patient = await getPatient(resolvedParams.id);
  const records = await getRecords(resolvedParams.id);

  if (!patient) {
    return <main className="p-8"><p>Patient not found.</p></main>;
  }

  return (
    <main className="p-8">
      <PatientProfileHeader patient={patient} />

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4">Patient Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Species</span>
                <span className="font-medium text-slate-900">{patient.species}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Breed</span>
                <span className="font-medium text-slate-900">{patient.breed || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Weight (kg)</span>
                <span className="font-medium text-slate-900">{patient.weight_kg || 'Unrecorded'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-2 space-y-6">
          <PatientSOAPNotes patientId={patient.id} records={records} />
        </div>
      </div>
    </main>
  );
}
