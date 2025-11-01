import React from 'react';

export default function HomePage({ onStartFlow, onShowAccount, isNewUser, activePass }) {
  return (
    <div className="flex flex-col space-y-4 animate-fadeIn">
      {isNewUser && activePass && activePass.id === 'free_card' && (
        <div className="bg-green-800 p-4 rounded-lg text-center shadow-inner">
          <h3 className="text-lg font-bold">Welcome!</h3>
          <p className="text-green-200">As a new user, you get one free card on us!</p>
        </div>
      )}
      <h2 className="text-2xl font-bold text-center mb-4">What would you like to do?</h2>

      <button
        onClick={() => onStartFlow('gift')}
        className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105">
        <span className="text-xl">Send a Monetary Greeting</span>
        <span className="block text-sm text-pink-100 mt-1">Package a Venmo or Cash App gift.</span>
      </button>

      <button
        onClick={() => onStartFlow('card')}
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105">
        <span className="text-xl">Send a Digital Card Only</span>
        <span className="block text-sm text-purple-100 mt-1">Create a custom card.</span>
      </button>

      <button
        onClick={onShowAccount}
        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 mt-4 max-w-xs mx-auto w-full">
        My Account / Purchase History
      </button>
    </div>
  );
}