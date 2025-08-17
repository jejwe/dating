import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check } from 'lucide-react';
import ScreenContainer from '../components/Layout/ScreenContainer';

const SubscriptionScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'vip' | 'coins'>('vip');
  const [selectedPlan, setSelectedPlan] = useState('1month');
  const [selectedPayment, setSelectedPayment] = useState('credit');

  const vipPlans = [
    {
      id: '1month',
      duration: '1 Month',
      price: '$19.99',
      originalPrice: '$19.99',
      discount: '99% OFF',
      monthly: '$19.99/month',
      popular: true
    },
    {
      id: '3month',
      duration: '3 Months',
      price: '$49.99',
      originalPrice: '$59.97',
      discount: '80% OFF',
      monthly: '$16.66/month'
    },
    {
      id: '6month',
      duration: '6 Months',
      price: '$79.99',
      originalPrice: '$119.94',
      discount: '70% OFF',
      monthly: '$13.33/month'
    },
    {
      id: '12month',
      duration: '12 Months',
      price: '$99.99',
      originalPrice: '$239.88',
      discount: '63% OFF',
      monthly: '$8.33/month'
    }
  ];

  const paymentMethods = [
    {
      id: 'credit',
      name: 'Credit Card',
      icon: '💳',
      description: 'Visa, Mastercard'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: '🅿️',
      description: 'PayPal'
    },
    {
      id: 'apple',
      name: 'Apple Pay',
      icon: '🍎',
      description: 'Apple Pay'
    }
  ];

  const handleProceedToPayment = () => {
    const selectedPlanData = vipPlans.find(plan => plan.id === selectedPlan);
    navigate('/subscription/confirm', { 
      state: { 
        plan: selectedPlanData,
        paymentMethod: paymentMethods.find(p => p.id === selectedPayment)
      } 
    });
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 p-4 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="text-indigo-400 hover:text-indigo-300 transition-colors mr-3"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-slate-100">Store</h1>
      </div>

      <div className="flex-1 p-4">
        {/* Tab Selector */}
        <div className="flex bg-slate-700 rounded-lg p-1 mb-6">
          <button
            onClick={() => setSelectedTab('vip')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              selectedTab === 'vip'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            VIP Membership
          </button>
          <button
            onClick={() => setSelectedTab('coins')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              selectedTab === 'coins'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Gold Coins
          </button>
        </div>

        {/* VIP Plans */}
        {selectedTab === 'vip' && (
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-3">
              {vipPlans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedPlan === plan.id
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-600 bg-slate-700/50'
                  } ${plan.popular ? 'border-orange-500 bg-orange-500/10' : ''}`}
                >
                  {plan.popular && (
                    <div className="text-xs font-bold text-orange-400 mb-1">Most Popular</div>
                  )}
                  <div className="text-white font-semibold mb-1">{plan.duration}</div>
                  <div className="text-2xl font-bold text-white mb-1">{plan.price}</div>
                  <div className="text-sm font-bold text-yellow-400 mb-1">{plan.discount}</div>
                  <div className="text-xs text-slate-400">{plan.monthly}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Coins Plans */}
        {selectedTab === 'coins' && (
          <div className="space-y-4 mb-6">
            <div className="text-center text-slate-400 py-8">
              <div className="text-4xl mb-2">🪙</div>
              <p>Gold Coins coming soon!</p>
            </div>
          </div>
        )}

        {/* Payment Methods */}
        <div className="mb-6">
          <h3 className="text-slate-300 font-semibold mb-3">Select Payment Method</h3>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={`w-full p-4 rounded-lg border-2 flex items-center transition-all ${
                  selectedPayment === method.id
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-600 bg-slate-700/50'
                }`}
              >
                <div className="w-6 h-6 rounded-full border-2 border-slate-400 mr-3 flex items-center justify-center">
                  {selectedPayment === method.id && (
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  )}
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{method.icon}</span>
                  <div className="text-left">
                    <div className="text-white font-medium">{method.name}</div>
                    <div className="text-sm text-slate-400">{method.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Proceed Button */}
        <button
          onClick={handleProceedToPayment}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-lg transition-colors"
        >
          Confirm Payment
        </button>
      </div>
    </ScreenContainer>
  );
};

export default SubscriptionScreen;