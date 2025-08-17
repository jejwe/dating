import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Check } from 'lucide-react';
import ScreenContainer from '../components/Layout/ScreenContainer';

const SubscriptionConfirmScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { plan, paymentMethod } = location.state || {};

  if (!plan || !paymentMethod) {
    return (
      <ScreenContainer>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400">Invalid order data</p>
        </div>
      </ScreenContainer>
    );
  }

  const benefits = [
    'Unlimited Likes',
    'See Who Likes You',
    '5 Super Likes per Month',
    'Ad-Free Experience',
    'Advanced Filters'
  ];

  const handleConfirmPayment = () => {
    // Simulate payment processing
    alert('Payment successful! Welcome to VIP!');
    navigate('/my-profile');
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
        <h1 className="text-lg font-semibold text-slate-100">Confirm Order</h1>
      </div>

      <div className="flex-1 p-6">
        {/* Order Summary */}
        <div className="text-center mb-8">
          <p className="text-slate-400 mb-2">You are purchasing</p>
          <h2 className="text-2xl font-bold text-white mb-2">{plan.duration} VIP Membership</h2>
          <div className="text-4xl font-bold text-yellow-400">{plan.price}</div>
        </div>

        {/* Payment Method */}
        <div className="mb-8">
          <h3 className="text-slate-300 font-semibold mb-3">Payment Method</h3>
          <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
            <div className="flex items-center">
              <span className="text-2xl mr-3">{paymentMethod.icon}</span>
              <div>
                <div className="text-white font-medium">{paymentMethod.name}</div>
                <div className="text-sm text-slate-400">**** **** 1234</div>
              </div>
            </div>
            <button className="text-indigo-400 text-sm font-medium">Change</button>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-8">
          <h3 className="text-slate-300 font-semibold mb-3">Membership Benefits</h3>
          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <Check size={14} className="text-white" />
                </div>
                <span className="text-slate-300">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirmPayment}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-lg transition-colors text-lg"
        >
          Pay Now {plan.price}
        </button>

        {/* Terms */}
        <p className="text-xs text-slate-500 text-center mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy.
          Subscription will auto-renew unless cancelled.
        </p>
      </div>
    </ScreenContainer>
  );
};

export default SubscriptionConfirmScreen;