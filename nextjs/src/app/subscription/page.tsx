'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import ScreenContainer from '@/components/Layout/ScreenContainer';

const SubscriptionScreenPage: React.FC = () => {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('1month');

  const vipPlans = [
    { id: '1month', duration: '1 Month', price: '$19.99', popular: true },
    { id: '3month', duration: '3 Months', price: '$49.99' },
    { id: '6month', duration: '6 Months', price: '$79.99' },
  ];

  const handleProceedToPayment = () => {
    router.push(`/subscription/confirm?planId=${selectedPlan}`);
  };

  return (
    <ScreenContainer>
      <div className="bg-slate-800 p-4 flex items-center">
        <button onClick={() => router.back()} className="mr-3"><ChevronLeft size={20} /></button>
        <h1 className="text-lg font-semibold text-white">Store</h1>
      </div>
      <div className="flex-1 p-4">
        <div className="grid grid-cols-2 gap-3">
          {vipPlans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`p-4 rounded-xl border-2 ${selectedPlan === plan.id ? 'border-indigo-500' : 'border-slate-600'}`}
            >
              <div className="text-white font-semibold">{plan.duration}</div>
              <div className="text-2xl font-bold text-white">{plan.price}</div>
              {plan.popular && <div className="text-xs text-orange-400">Most Popular</div>}
            </button>
          ))}
        </div>
        <button
          onClick={handleProceedToPayment}
          className="w-full mt-6 bg-indigo-600 text-white font-semibold py-4 rounded-lg"
        >
          Confirm Payment
        </button>
      </div>
    </ScreenContainer>
  );
};

export default SubscriptionScreenPage;
