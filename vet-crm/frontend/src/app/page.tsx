import React from 'react';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { cookies } from 'next/headers';
import DashboardHeader from './DashboardHeader';
import ReceptionistDashboard from './ReceptionistDashboard';
import VetDashboard from './VetDashboard';
import AdminDashboard from './AdminDashboard';

async function getPatients() {
  try {
    const res = await fetch('http://localhost:8000/patients/', { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    return [];
  }
}

async function getAppointments() {
  try {
    const res = await fetch('http://localhost:8000/appointments/', { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    return [];
  }
}

export default async function Dashboard() {
  const cookieStore = await cookies();
  const role = cookieStore.get('user_role')?.value || 'admin';
  const name = cookieStore.get('user_name')?.value || 'User';

  const patients = await getPatients();
  const appointments = await getAppointments();

  return (
    <main className="p-8">
      <DashboardHeader userName={name} userRole={role} />

      {role === 'vet' ? (
        <VetDashboard patients={patients} appointments={appointments} />
      ) : role === 'admin' ? (
        <AdminDashboard patients={patients} appointments={appointments} />
      ) : (
        <ReceptionistDashboard patients={patients} appointments={appointments} />
      )}
    </main>
  );
}
