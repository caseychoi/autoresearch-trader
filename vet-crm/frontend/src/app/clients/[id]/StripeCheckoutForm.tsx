'use client';
import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

export default function StripeCheckoutForm({ onSuccess, onCancel, amount }: { onSuccess: (paymentIntentId: string) => void, onCancel: () => void, amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || 'An error occurred');
      setLoading(false);
      return;
    }

    const result = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (result.error) {
      setError(result.error.message || 'Payment failed');
    } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
      onSuccess(result.paymentIntent.id);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <PaymentElement />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="pt-2 flex justify-end space-x-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
        <button type="submit" disabled={!stripe || loading} className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
        </button>
      </div>
    </form>
  );
}
