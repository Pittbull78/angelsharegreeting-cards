import React from 'react';

export default function AccountPage({ history, pass, onBack, shareCount, referralCredits, checkReferralRewards }) {
  return (
    <div className="flex flex-col space-y-4 animate-fadeIn">
      <h2 className="text-2xl font-bold text-center mb-4">My Account</h2>

      {pass ? (
        <div className="bg-green-800 p-4 rounded-lg text-center shadow-inner">
          <h3 className="text-lg font-bold">Active 30-Day Pass</h3>
          <p className="text-green-200">Expires: {pass.expiresString}</p>
        </div>
      ) : (
         <div className="bg-gray-700 p-4 rounded-lg text-center shadow-inner">
          <h3 className="text-lg font-bold">No Active Pass</h3>
          <p className="text-gray-400">Purchase a pass for 30 days of unlimited cards.</p>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-xl font-bold mb-3">Referral Program</h3>
        <div className="bg-gray-700 p-4 rounded-lg shadow-inner">
          <div className="flex justify-between items-center">
            <p className="text-gray-300">Your Share Count:</p>
            <p className="text-2xl font-bold text-pink-400">{shareCount}</p>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-gray-300">Referral Credits:</p>
            <p className="text-2xl font-bold text-green-400">{referralCredits}</p>
          </div>
          <button
            onClick={checkReferralRewards}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 mt-4">
            Check for Referral Rewards
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold mb-3">Purchase History</h3>
        <div className="bg-gray-700 p-4 rounded-lg shadow-inner max-h-60 overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-gray-400 text-center">No purchases found.</p>
          ) : (
            <ul className="space-y-3">
              {history.slice().reverse().map(item => ( // Show newest first
                <li key={item.id} className="flex justify-between items-center border-b border-gray-600 pb-2 last:border-b-0 last:pb-0">
                  <div>
                    <span className="font-bold">{item.type}</span>
                    <span className="block text-sm text-gray-400">Purchased: {item.date}</span>
                  </div>
                  <span className="text-lg font-bold">${item.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <button
        onClick={onBack}
        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 mt-4 max-w-xs mx-auto w-full">
        Back
      </button>
    </div>
  );
}