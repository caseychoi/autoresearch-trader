import React from 'react';
import { Search } from 'lucide-react';
import ClientPageHeader from './ClientPageHeader';

async function getClients() {
  try {
    const res = await fetch('http://localhost:8000/clients/', { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    return [];
  }
}

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <main className="p-8">
      <ClientPageHeader />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex">
          <div className="relative w-96">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by client name, pet name, or phone..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-indigo-50 text-indigo-950 text-base font-bold text-left uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 border-b border-slate-200">Client Name</th>
              <th className="px-6 py-4 border-b border-slate-200">Phone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clients.map((client: any) => (
              <tr key={client.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium">
                  <a href={`/clients/${client.id}`} className="text-blue-600 hover:underline">
                    {client.first_name} {client.last_name}
                  </a>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {client.phone}
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-slate-500">No clients found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
