import React, { useState, useEffect } from 'react';

export default function FinalCardPage({ finalCardUrl, onStartOver, userId }) {
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    if (userId) {
      const link = `https://angelsharegreetingcards.com/?ref=${userId}`;
      setReferralLink(link);
    }
  }, [userId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      const currentCount = parseInt(localStorage.getItem('angelshareShareCount') || '0', 10);
      localStorage.setItem('angelshareShareCount', currentCount + 1);
    }).catch(err => {
      console.error('Clipboard write failed: ', err);
      alert('Failed to copy link.');
    });
  };

  return (
    <div className="text-center space-y-4 animate-fadeIn">
      <h2 className="text-2xl font-bold text-green-400 mb-4">Your Card is Ready!</h2>

      <p className="text-gray-300">Download the card image below to share it with your recipient.</p>

      {/* Display the final, generated card image */}
      {finalCardUrl ? (
        <img src={finalCardUrl} alt="Generated Greeting Card" className="w-full aspect-[4/3] rounded-lg shadow-lg" />
      ) : (
        <div className="w-full aspect-[4/3] rounded-lg bg-gray-700 flex items-center justify-center">
          <p className="text-gray-400">Generating card...</p>
        </div>
      )}

      <div className="bg-gray-700 p-4 rounded-lg mt-4">
        <label htmlFor="share-link" className="block text-sm font-bold text-gray-300 mb-2">Copy your referral link to earn rewards:</label>
        <div className="flex space-x-2">
           <textarea
            id="share-link"
            readOnly
            value={referralLink}
            className="w-full bg-gray-800 text-gray-300 p-3 rounded border border-gray-600 focus:outline-none resize-none h-12"
            rows="1"
          ></textarea>
          <button
            onClick={handleCopy}
            className={`w-28 flex-shrink-0 font-bold py-3 px-4 rounded-lg shadow-lg transition-all ${copied ? 'bg-green-500' : 'bg-pink-600 hover:bg-pink-700'}`}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <a
          href={finalCardUrl}
          download="angelshare-card.png"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all duration-200 inline-block"
        >
          Download Card
        </a>
        <button
          onClick={onStartOver}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all duration-200">
          Create Another Card
        </button>
      </div>
    </div>
  );
}