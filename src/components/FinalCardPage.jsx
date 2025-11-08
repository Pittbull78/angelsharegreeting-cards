import React, { useState, useEffect, useRef } from 'react';
import * as htmlToImage from 'html-to-image';

export default function FinalCardPage({ cardDetails, giftDetails, onStartOver, userId }) {
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

    htmlToImage.toPng(cardRef.current, { cacheBust: true, })
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

  const occasionStyles = { fontFamily: cardDetails.occasionFont, color: cardDetails.occasionColor, fontWeight: cardDetails.occasionFontWeight, fontSize: `${cardDetails.occasionFontSize}px` };
  const messageStyles = { fontFamily: cardDetails.messageFont, color: cardDetails.messageColor, fontWeight: cardDetails.messageFontWeight, fontSize: `${cardDetails.messageFontSize}px` };
  const senderStyles = { ...messageStyles, fontSize: `${Math.max(12, cardDetails.messageFontSize * 0.8)}px` };

  const generateQrCodeUrl = (details) => {
    if (!details.username || !details.amount) return null;

    let link;
    if (details.platform === 'cashapp') {
      // Remove leading '$' if present
      const cleanUsername = details.username.replace(/^\$/, '');
      link = `https://cash.app/$${cleanUsername}/${details.amount}`;
    } else { // venmo
      // Remove leading '@' if present
      const cleanUsername = details.username.replace(/^@/, '');
      link = `https://venmo.com/paycharge?txn=pay&recipients=${cleanUsername}&amount=${details.amount}&note=For%20${details.recipient.replace(' ', '%20')}`;
    }

    // Use a public QR code generator API
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(link)}`;
  };

  const qrCodeUrl = generateQrCodeUrl(giftDetails);

  return (
    <div className="text-center space-y-4 animate-fadeIn">
      <h2 className="text-2xl font-bold text-green-400 mb-4">Your Card is Ready!</h2>

      <p className="text-gray-300">Download the card image and send it to your recipient. They will scan the QR code to claim their gift.</p>

      {/* This is the final card that will be downloaded */}
      <div ref={cardRef} className="w-full aspect-[4/3] rounded-lg flex items-center justify-center text-center p-4 shadow-inner relative overflow-hidden" style={{ background: cardDetails.background }}>
        {cardDetails.photo && <img src={cardDetails.photo} alt="Preview" className="absolute top-0 left-0 w-full h-full object-cover" />}
        <div className="z-10 relative w-full h-full flex flex-col justify-center items-center p-4">
          <div className="cursor-pointer">
            <p className="font-bold drop-shadow-md" style={occasionStyles}>{cardDetails.greetingText}</p>
          </div>
          <div className="cursor-pointer mt-4">
            <p className="drop-shadow-md" style={messageStyles}>{cardDetails.message}</p>
            <p className="italic drop-shadow-md mt-6" style={senderStyles}>from {cardDetails.sender}</p>
          </div>
          {qrCodeUrl && (
            <div className="mt-4">
              <img src={qrCodeUrl} alt="Gift QR Code" className="w-24 h-24 mx-auto rounded-lg border-2 border-white shadow-lg bg-white" />
            </div>
          )}
        </div>
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