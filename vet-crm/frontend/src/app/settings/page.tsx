import React from 'react';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getServices() {
  try {
    const res = await fetch('http://localhost:8000/services/', { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    return [];
  }
}

export default async function SettingsPage() {
  const services = await getServices();

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-indigo-900 tracking-tight">Clinic Settings</h1>
        <p className="text-slate-500 mt-2">Manage your clinic profile, staff, services, and system configuration.</p>
      </div>

      <SettingsClient initialServices={services} />
    </main>
  );
}
