'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Check } from 'lucide-react';
import ScreenContainer from '@/components/Layout/ScreenContainer';

const SubscriptionConfirmPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('planId');

  const vipPlans = [
    { id: '1month', duration: '1 Month', price: '$19.99' },
    { id: '3month', duration: '3 Months', price: '$49.99' },
    { id: '6month', duration: '6 Months', price: '$79.99' },
  ];

  const plan = vipPlans.find(p => p.id === planId);

  if (!plan) {
    return (
      <ScreenContainer>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400">Invalid plan selected</p>
        </div>
      </ScreenContainer>
    );
  }

  const handleConfirmPayment = () => {
    alert('Payment successful!');
    router.push('/my-profile');
  };

  return (
    <ScreenContainer>
      <div className="bg-slate-800 p-4 flex items-center">
        <button onClick={() => router.back()} className="mr-3"><ChevronLeft size={20} /></button>
        <h1 className="text-lg font-semibold text-white">Confirm Order</h1>
      </div>
      <div className="flex-1 p-6">
        <div className="text-center mb-8">
          <p className="text-slate-400 mb-2">You are purchasing</p>
          <h2 className="text-2xl font-bold text-white mb-2">{plan.duration} VIP</h2>
          <div className="text-4xl font-bold text-yellow-400">{plan.price}</div>
        </div>
        <button
          onClick={handleConfirmPayment}
          className="w-full bg-orange-500 text-white font-bold py-4 rounded-lg"
        >
          Pay Now {plan.price}
        </button>
      </div>
    </ScreenContainer>
  );
};

export default SubscriptionConfirmPage;
