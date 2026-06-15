'use client';
import React, { useState, useEffect } from 'react';
import { FileText, Plus, CreditCard, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeCheckoutForm from './StripeCheckoutForm';

const stripePromise = loadStripe('pk_test_123');

export default function BillingSection({ clientId, patients }: { clientId: string, patients: any[] }) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  
  // Invoice generation state
  const [isDrafting, setIsDrafting] = useState(false);
  const [lineItems, setLineItems] = useState([{ service_id: '', patient_id: '', description: '', quantity: 1, unit_price: 0 }]);
  
  // Payment state
  const [payingInvoice, setPayingInvoice] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('stripe_card');
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    fetch(`http://localhost:8000/clients/${clientId}/invoices`).then(res => res.json()).then(setInvoices);
    fetch(`http://localhost:8000/services/`).then(res => res.json()).then(setServices);
  }, [clientId]);

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const handleServiceSelect = (index: number, serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    const newItems = [...lineItems];
    newItems[index].service_id = serviceId;
    if (service) {
      newItems[index].description = service.name;
      newItems[index].unit_price = service.price;
    }
    setLineItems(newItems);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/invoices/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          line_items: lineItems
        })
      });
      if (res.ok) {
        setIsDrafting(false);
        setLineItems([{ service_id: '', patient_id: '', description: '', quantity: 1, unit_price: 0 }]);
        const freshInvoices = await fetch(`http://localhost:8000/clients/${clientId}/invoices`).then(res => res.json());
        setInvoices(freshInvoices);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;

    if (paymentMethod === 'stripe_card') {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:8000/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoice_id: payingInvoice.id, amount: paymentAmount })
        });
        const data = await res.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/invoices/${payingInvoice.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: paymentAmount, payment_method: paymentMethod })
      });
      if (res.ok) {
        setPayingInvoice(null);
        setPaymentAmount(0);
        const freshInvoices = await fetch(`http://localhost:8000/clients/${clientId}/invoices`).then(res => res.json());
        setInvoices(freshInvoices);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleStripeSuccess = async (paymentIntentId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/invoices/${payingInvoice.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: paymentAmount, payment_method: 'stripe_card', stripe_payment_intent_id: paymentIntentId })
      });
      if (res.ok) {
        setPayingInvoice(null);
        setPaymentAmount(0);
        setClientSecret('');
        const freshInvoices = await fetch(`http://localhost:8000/clients/${clientId}/invoices`).then(r => r.json());
        setInvoices(freshInvoices);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-900">Billing & Invoices</h3>
        <button 
          onClick={() => setIsDrafting(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" /> Create Invoice
        </button>
      </div>

      {isDrafting && (
        <form onSubmit={handleCreateInvoice} className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <h4 className="font-bold text-slate-800 mb-4">Draft New Invoice</h4>
          {lineItems.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 mb-4 items-end">
              <div className="col-span-3">
                <label className="block text-xs font-medium text-slate-500 mb-1">Service</label>
                <select value={item.service_id} onChange={e => handleServiceSelect(i, e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Select a service...</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} (${s.price})</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">Patient</label>
                <select value={item.patient_id} onChange={e => { const newItems = [...lineItems]; newItems[i].patient_id = e.target.value; setLineItems(newItems); }} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">None</option>
                  {patients.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="col-span-4">
                <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                <input required value={item.description} onChange={e => { const newItems = [...lineItems]; newItems[i].description = e.target.value; setLineItems(newItems); }} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">Qty</label>
                <input type="number" min="1" value={item.quantity} onChange={e => { const newItems = [...lineItems]; newItems[i].quantity = parseInt(e.target.value); setLineItems(newItems); }} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">Price ($)</label>
                <input type="number" step="0.01" value={item.unit_price} onChange={e => { const newItems = [...lineItems]; newItems[i].unit_price = parseFloat(e.target.value); setLineItems(newItems); }} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setLineItems([...lineItems, { service_id: '', patient_id: '', description: '', quantity: 1, unit_price: 0 }])} className="text-indigo-600 text-sm font-medium hover:underline">+ Add Line Item</button>
            <div className="text-right">
              <span className="text-slate-500 mr-4">Total:</span>
              <span className="text-2xl font-bold text-slate-900">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-end mt-6 space-x-3">
            <button type="button" onClick={() => setIsDrafting(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Cancel</button>
            <button type="submit" disabled={loading || calculateTotal() === 0} className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">Save Invoice</button>
          </div>
        </form>
      )}

      {payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="font-bold text-slate-900 mb-2">Receive Payment</h3>
            <p className="text-sm text-slate-500 mb-4">Invoice Total: ${payingInvoice.total_amount.toFixed(2)}</p>
            {clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripeCheckoutForm 
                  amount={paymentAmount} 
                  onSuccess={handleStripeSuccess} 
                  onCancel={() => { setClientSecret(''); setPayingInvoice(null); }} 
                />
              </Elements>
            ) : (
              <form onSubmit={handlePay} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount to Pay ($)</label>
                  <input type="number" step="0.01" max={payingInvoice.total_amount - payingInvoice.amount_paid} value={paymentAmount} onChange={e => setPaymentAmount(parseFloat(e.target.value))} className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Method</label>
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="stripe_card">Credit Card (Stripe)</option>
                    <option value="manual_card">External Terminal</option>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                  </select>
                </div>
                <div className="pt-2 flex justify-end space-x-3">
                  <button type="button" onClick={() => setPayingInvoice(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
                  <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700">
                    {paymentMethod === 'stripe_card' ? 'Proceed to Payment' : 'Confirm Payment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 text-slate-600 text-sm font-bold uppercase tracking-wider text-left border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map(inv => (
              <tr key={inv.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-slate-900 font-medium">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-slate-400" />
                    {new Date(inv.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-slate-900">${inv.total_amount.toFixed(2)}</span>
                  {inv.amount_paid > 0 && <span className="text-xs text-slate-500 ml-2">(${inv.amount_paid.toFixed(2)} paid)</span>}
                </td>
                <td className="px-6 py-4">
                  {inv.status === 'paid' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {inv.status !== 'paid' && (
                    <button 
                      onClick={() => {
                        setPayingInvoice(inv);
                        setPaymentAmount(inv.total_amount - inv.amount_paid);
                      }}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors"
                    >
                      Receive Payment
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No invoices generated for this client.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
