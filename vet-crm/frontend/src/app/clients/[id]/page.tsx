import React from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Phone, Mail } from 'lucide-react';
import ClientDetailHeader from './ClientDetailHeader';
import BillingSection from './BillingSection';

async function getClient(id: string) {
  try {
    const res = await fetch(`http://localhost:8000/clients/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    return null;
  }
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const client = await getClient(resolvedParams.id);

  if (!client) {
    return (
      <main className="p-8">
        <p>Client not found.</p>
        <Link href="/clients" className="text-blue-600 hover:underline">Go back</Link>
      </main>
    );
  }

  return (
    <main className="p-8">
      <div className="mb-6">
        <Link href="/clients" className="inline-flex items-center text-slate-500 hover:text-slate-700 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Clients
        </Link>
      </div>

      <ClientDetailHeader client={client} />

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4">Client Details</h3>
            <div className="space-y-3">
              <div className="flex items-center text-slate-600">
                <User className="w-4 h-4 mr-3 text-slate-400" />
                {client.first_name} {client.last_name}
              </div>
              <div className="flex items-center text-slate-600">
                <Phone className="w-4 h-4 mr-3 text-slate-400" />
                {client.phone}
              </div>
              {client.email && (
                <div className="flex items-center text-slate-600">
                  <Mail className="w-4 h-4 mr-3 text-slate-400" />
                  {client.email}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-900">Enrolled Patients (Pets)</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {client.patients && client.patients.length > 0 ? (
                client.patients.map((patient: any) => (
                  <div key={patient.id} className="p-6 flex items-center hover:bg-slate-50">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-4">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <Link href={`/patients/${patient.id}`} className="font-medium text-blue-600 hover:underline text-lg">{patient.name}</Link>
                      <p className="text-sm text-slate-500">{patient.species} {patient.breed ? `• ${patient.breed}` : ''}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-slate-500">No patients enrolled for this client yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <BillingSection clientId={client.id} patients={client.patients || []} />
    </main>
  );
}
