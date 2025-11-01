import React, { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';

export default function FinalCardPage({ cardUrl, onStartOver, userId }) {
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState('');
  const cardRef = useRef(null);

  useEffect(() => {
    if (userId) {
      const link = `https://angelsharegreetingcards.com/?ref=${userId}`;
      setReferralLink(link);
    }
  }, [userId]);

  const handleCopy = () => {
    const input = document.getElementById('share-link');
    if (!input) return;
    input.select();
    input.setSelectionRange(0, 99999); // For mobile devices

    try {
      navigator.clipboard.writeText(referralLink).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        // Increment share count
        const currentCount = parseInt(localStorage.getItem('angelshareShareCount') || '0', 10);
        localStorage.setItem('angelshareShareCount', currentCount + 1);
      }, (err) => {
        console.error('Clipboard write failed, trying execCommand: ', err);
        fallbackCopyTextToClipboard(referralLink);
      });
    } catch (err) {
      console.error('Clipboard API failed, trying execCommand: ', err);
      fallbackCopyTextToClipboard(referralLink);
    }
  };

  const fallbackCopyTextToClipboard = (text) => {
    const input = document.getElementById('share-link');
    if (!input) return;
    input.select();
    input.setSelectionRange(0, 99999); // For mobile devices
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        // Increment share count
        const currentCount = parseInt(localStorage.getItem('angelshareShareCount') || '0', 10);
        localStorage.setItem('angelshareShareCount', currentCount + 1);
      } else {
        console.error('execCommand failed');
        alert('Copy failed. Please copy the link manually.');
      }
    } catch (err) {
      console.error('Fallback copy failed: ', err);
      alert('Copy failed. Please copy the link manually.');
    }
  };

  const handleDownload = () => {
    if (cardRef.current === null) {
      return;
    }

    toPng(cardRef.current, { cacheBust: true, })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'angelshare-card.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error(err);
        alert('Oops, something went wrong! Could not download the card.');
      });
  };

  return (
    <div className="text-center space-y-4 animate-fadeIn">
      <h2 className="text-2xl font-bold text-green-400 mb-4">Your Card is Ready!</h2>

      <p className="text-gray-300">Download the card image and send it to your recipient. They will scan the QR code to claim their gift.</p>

      {/* This is the final card that will be downloaded */}
      <div ref={cardRef} className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-lg shadow-xl inline-block max-w-sm w-full"> {/* Constrain width */}
        {cardUrl.includes('qrserver') ? (
          <>
            <h3 className="text-xl font-bold mb-2 text-white">You've received a monetary greeting!</h3>
            <img src={cardUrl} alt="Gift QR Code" className="w-40 h-40 mx-auto rounded-lg border-4 border-white shadow-lg bg-white" />
            <p className="text-sm mt-4 text-gray-200 font-bold">Scan this code with your phone's camera to claim your gift.</p>
          </>
        ) : (
          <img src={cardUrl} alt="Final Card Preview" className="w-full h-auto object-cover rounded-lg border-4 border-white" />
        )}
      </div>

      <div className="bg-gray-700 p-4 rounded-lg mt-4">
        <label htmlFor="share-link" className="block text-sm font-bold text-gray-300 mb-2">Copy your referral link:</label>
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
        <button
          onClick={handleDownload}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all duration-200">
          Download Card
        </button>
        <button
          onClick={onStartOver}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all duration-200">
          Create Another Card
        </button>
      </div>
    </div>
  );
}