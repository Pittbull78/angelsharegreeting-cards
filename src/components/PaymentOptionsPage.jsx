import React from 'react';
import { PRICES } from '../prices';

export default function PaymentOptionsPage({ onSelectPurchase, onBack }) {
  return (
    <div className="flex flex-col space-y-4 animate-fadeIn">
      <h2 className="text-2xl font-bold text-center mb-4">Choose Your Plan</h2>

      <button
        onClick={() => onSelectPurchase('single')}
        className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105">
        <span className="text-xl">Single Card</span>
        <span className="block text-sm text-pink-100 mt-1">${PRICES.SINGLE_CARD.toFixed(2)} - One-time purchase</span>
      </button>

      <button
        onClick={() => onSelectPurchase('pass')}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105">
        <span className="text-xl">30-Day Pass</span>
        <span className="block text-sm text-green-100 mt-1">${PRICES.THIRTY_DAY_PASS.toFixed(2)} - Unlimited cards for 30 days</span>
      </button>

      <button
        onClick={onBack}
        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 mt-4 max-w-xs mx-auto w-full">
        Back
      </button>
    </div>
  );
}