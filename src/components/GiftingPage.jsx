import React, { useState } from 'react';

export default function GiftingPage({ giftDetails, setGiftDetails, onNext, onBack }) { // Added onBack
  // Local state for the form
  const [amount, setAmount] = useState(giftDetails.amount);
  const [username, setUsername] = useState(giftDetails.username);
  const [platform, setPlatform] = useState(giftDetails.platform);
  const [recipient, setRecipient] = useState(giftDetails.recipient);
  const [isUsernameValid, setIsUsernameValid] = useState(false);

  const validateUsername = (value, selectedPlatform) => {
    if (selectedPlatform === 'cashapp') {
      // Cash App usernames are 1-20 characters, letters and numbers
      return /^[a-zA-Z0-9]{1,20}$/.test(value);
    } else { // venmo
      // Venmo usernames are 5-30 characters, letters, numbers, and hyphens
      return /^[a-zA-Z0-9-]{5,30}$/.test(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (amount < 1) {
        alert("Gift amount must be at least $1.");
        return;
    }
    if (!username.trim()) {
        alert("Please enter your username.");
        return;
    }
     if (!recipient.trim()) {
        alert("Please enter the recipient's name.");
        return;
    }
    // Save to the main app state on submit
    setGiftDetails({ amount, username: username.trim(), platform, recipient: recipient.trim() });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fadeIn">
      <h2 className="text-2xl font-bold text-center mb-4">Add a Monetary Greeting</h2>

      <p className="text-sm text-gray-400 text-center -mt-2 mb-2">
        We'll embed a QR code in your card. The recipient scans it to request the gift directly from you.
        AngelShare LLC never touches the gift money.
      </p>

      <div>
        <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="amount">
          Gift Amount
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="25"
          required
          min="1"
        />
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-bold mb-2">
          Your Gifting App
        </label>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setPlatform('cashapp')}
            className={`flex-1 py-3 rounded-lg font-bold transition-all ${platform === 'cashapp' ? 'bg-green-500 text-white ring-2 ring-green-200' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}>
            Cash App
          </button>
          <button
            type="button"
            onClick={() => setPlatform('venmo')}
            className={`flex-1 py-3 rounded-lg font-bold transition-all ${platform === 'venmo' ? 'bg-blue-500 text-white ring-2 ring-blue-200' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}>
            Venmo
          </button>
        </div>
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="username">
          Your Username ({platform === 'cashapp' ? '$Cashtag' : '@Username'})
        </label>
        <div className="flex items-center bg-gray-700 rounded border border-gray-600 focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-500">
           <span className="text-gray-400 p-3">{platform === 'cashapp' ? '$' : '@'}</span>
           <input
            type="text"
            id="username"
            value={username}
            // Automatically remove the prefix character if typed
            onChange={(e) => {
              const value = e.target.value.replace(/[@$]/g, '');
              setUsername(value);
              setIsUsernameValid(validateUsername(value, platform));
            }}
            className="w-full bg-transparent text-white p-3 pl-0 focus:outline-none"
            placeholder={platform === 'cashapp' ? 'YourCashtag' : 'Your-Username'}
            required
          />
          {username && (
            <span className="p-2">
              {isUsernameValid ? '✅' : '❌'}
            </span>
          )}
        </div>
      </div>

       <div>
        <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="recipient">
          Recipient's Name (for the memo)
        </label>
        <input
          type="text"
          id="recipient"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="Jane Doe"
          required
        />
      </div>

        <div className="flex justify-between items-center mt-6">
             <button
                type="button" // Important: Prevents form submission
                onClick={onBack}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-200"
            >
                Back
            </button>
              <button
                type="submit"
                className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all duration-200"
            >
                Next: Design Your Card
            </button>
        </div>

    </form>
  );
}