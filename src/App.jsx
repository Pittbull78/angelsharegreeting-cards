import React, { useState, useEffect, useRef } from 'react';
import domtoimage from 'dom-to-image-more';

import HomePage from './components/HomePage';
import PaymentOptionsPage from './components/PaymentOptionsPage';
import LoadingSpinner from './components/LoadingSpinner';
import PaymentPage from './components/PaymentPage';
import GiftingPage from './components/GiftingPage';
import CardEditor from './components/CardEditor';
import FinalCardPage from './components/FinalCardPage';
import AccountPage from './components/AccountPage';

// --- CONFIGURATION ---
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// --- Pricing ---
import { PRICES } from './prices';

// --- Main App Component ---
export default function App() {
  const [page, setPage] = useState('home');
  const [purchaseType, setPurchaseType] = useState(null);
  const [includesGift, setIncludesGift] = useState(false);

  const [giftDetails, setGiftDetails] = useState({ amount: 25, username: '', platform: 'cashapp', recipient: '' });
  const [cardDetails, setCardDetails] = useState({
    occasion: 'birthday',
    greetingText: 'Birthday',
    message: '',
    sender: '',
    photo: null,
    background: 'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)',
    occasionFont: "'Dancing Script', cursive",
    occasionFontWeight: 700,
    occasionFontSize: 48,
    occasionColor: '#FFFFFF',
    messageFont: "'Inter', sans-serif",
    messageFontWeight: 400,
    messageFontSize: 20,
    messageColor: '#FFFFFF',
    areColorsLinked: true,
    plaqueDetails: {
      occasion: { blur: 0, size: 70 },
      message: { blur: 0, size: 80 },
    }
  });

  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [activePass, setActivePass] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [userId, setUserId] = useState(null);
  const [shareCount, setShareCount] = useState(0);
  const [referralCredits, setReferralCredits] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [finalCardUrl, setFinalCardUrl] = useState('');
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [error, setError] = useState(null);
  const cardRef = useRef();

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (import.meta.env.DEV && urlParams.get('demo') === 'true') {
        setIsDemoMode(true);
      }

      let storedUserId = localStorage.getItem('angelshareUserId');
      if (!storedUserId) {
        storedUserId = `user_${new Date().getTime()}`;
        localStorage.setItem('angelshareUserId', storedUserId);
      }
      setUserId(storedUserId);

      const storedShareCount = parseInt(localStorage.getItem('angelshareShareCount') || '0', 10);
      setShareCount(storedShareCount);

      const storedReferralCredits = parseInt(localStorage.getItem('angelshareReferralCredits') || '0', 10);
      setReferralCredits(storedReferralCredits);

      const history = JSON.parse(localStorage.getItem('angelshareHistory') || '[]');
      setPurchaseHistory(history);

      const referrerId = urlParams.get('ref');

      if (history.length === 0) {
        if (referrerId) {
          setIsNewUser(true);
          setActivePass({ id: 'free_card_referred', type: 'Free Card (Referred)', count: 10 });
        } else {
          setIsNewUser(true);
          setActivePass({ id: 'free_card', type: 'Free Card', count: 10 });
        }
      } else {
        const now = new Date().getTime();
        const validPass = history
          .filter(item => item.type === '30-Day Pass' && item.expires > now)
          .sort((a, b) => b.expires - a.expires)[0];

        if (validPass) {
          setActivePass(validPass);
        }
      }
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      localStorage.clear();
    }
  }, []);

  const handleStartFlow = (type) => {
    setIncludesGift(type === 'gift');

    if (import.meta.env.VITE_FREE_MODE === 'true') {
      setPurchaseType('free_mode');
      if (type === 'gift') {
        setPage('gifting');
      } else {
        setPage('editor');
      }
      return;
    }

    if (activePass) {
      setPurchaseType(activePass.id.startsWith('free_card') ? 'free_card' : 'pass_active');
      if (type === 'gift') {
        setPage('gifting');
      } else {
        setPage('editor');
      }
    } else if (referralCredits > 0) {
      setPurchaseType('referral_credit');
      if (type === 'gift') {
        setPage('gifting');
      } else {
        setPage('editor');
      }
    } else {
      setPage('payment_options');
    }
  };

  const handleSelectPurchase = (type) => {
    setPurchaseType(type);

    if (isDemoMode) {
      handlePaymentSuccess();
      return;
    }

    const amount = type === 'single' ? PRICES.SINGLE_CARD : PRICES.THIRTY_DAY_PASS;
    setPaymentAmount(amount);
    fetchPaymentIntent(amount);
  };

  const fetchPaymentIntent = (amount) => {
    setPage('loading');
    fetch(`${BACKEND_URL}/api/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Math.round(amount * 100) })
    })
    .then(res => res.ok ? res.json() : res.json().then(err => { throw new Error(err.error || `Server error: ${res.status}`) }))
    .then(data => {
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setPage('payment');
      } else {
        throw new Error("Invalid response from server (missing clientSecret).");
      }
    })
    .catch(err => {
        setError(`Error: Could not initialize payment. 
${err.message}\nPlease check your backend connection and Vercel logs, then try again.`);
        console.error("Fetch Payment Intent Error:", err);
        setPage('payment_options');
    });
  };

  const handlePaymentSuccess = () => {
    const now = new Date();
    let newPurchase;

    if (purchaseType === 'pass') {
      const expiryTime = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
      newPurchase = { id: now.getTime(), type: '30-Day Pass', date: now.toLocaleDateString(), amount: PRICES.THIRTY_DAY_PASS, expires: expiryTime.getTime(), expiresString: expiryTime.toLocaleDateString() };
      setActivePass(newPurchase);
    } else {
      newPurchase = { id: now.getTime(), type: 'Single Card', date: now.toLocaleDateString(), amount: PRICES.SINGLE_CARD };
    }

    const newHistory = [...purchaseHistory, newPurchase];
    setPurchaseHistory(newHistory);
    localStorage.setItem('angelshareHistory', JSON.stringify(newHistory));

    if (includesGift) {
      setPage('gifting');
    } else {
      setPage('editor');
    }
  };

  const handleFinishEditing = async () => {
    setPage('loading');
    if (!cardRef.current) {
      setError("An error occurred while creating the card. Please try again.");
      setPage('editor');
      return;
    }

    try {
      const node = cardRef.current;
      const scale = 2;
      const options = {
        width: node.offsetWidth * scale,
        height: node.offsetHeight * scale,
        style: { transform: `scale(${scale})`, transformOrigin: 'top left' },
        cacheBust: true
      };
      const dataUrl = await domtoimage.toPng(node, options);
      setFinalCardUrl(dataUrl);

      if (purchaseType === 'free_card' && activePass && activePass.count > 0) {
        const newCount = activePass.count - 1;
        const newPurchase = { id: new Date().getTime(), type: activePass.type, date: new Date().toLocaleDateString(), amount: 0 };
        const newHistory = [...purchaseHistory, newPurchase];
        setPurchaseHistory(newHistory);
        localStorage.setItem('angelshareHistory', JSON.stringify(newHistory));
        if (newCount === 0) {
          setActivePass(null);
          setIsNewUser(false);
        } else {
          setActivePass({ ...activePass, count: newCount });
        }
      } else if (purchaseType === 'referral_credit') {
        const newCredits = referralCredits - 1;
        setReferralCredits(newCredits);
        localStorage.setItem('angelshareReferralCredits', newCredits);
        const newPurchase = { id: new Date().getTime(), type: 'Referral Credit Used', date: new Date().toLocaleDateString(), amount: 0 };
        const newHistory = [...purchaseHistory, newPurchase];
        setPurchaseHistory(newHistory);
        localStorage.setItem('angelshareHistory', JSON.JSON.stringify(newHistory));
      } else if (purchaseType === 'free_mode') {
        const newPurchase = { id: new Date().getTime(), type: 'Free Card (Admin)', date: new Date().toLocaleDateString(), amount: 0 };
        const newHistory = [...purchaseHistory, newPurchase];
        setPurchaseHistory(newHistory);
        localStorage.setItem('angelshareHistory', JSON.stringify(newHistory));
      }
      
      setPage('final');

    } catch (error) {
      console.error("Card generation error:", error);
      setError("Sorry, there was an issue creating your card image. Please try again.");
      setPage('editor');
    }
  };

  const handleStartOver = () => {
    setPage('home');
    setIncludesGift(false);
    setGiftDetails({ amount: 25, username: '', platform: 'cashapp', recipient: '' });
    setCardDetails({ ...cardDetails, occasion: 'birthday', greetingText: 'Birthday', message: '', sender: '', photo: null, background: 'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)' });
    setClientSecret(null);
    setPaymentAmount(0);
    setError(null);
  };

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage onStartFlow={handleStartFlow} onShowAccount={() => setPage('account')} isNewUser={isNewUser} activePass={activePass} />;
      case 'payment_options':
        return <PaymentOptionsPage onSelectPurchase={handleSelectPurchase} onBack={() => setPage('home')} />;
      case 'loading':
        return <LoadingSpinner message={page === 'loading' ? 'Initializing Payment...' : 'Generating Card...'} />;
      case 'payment':
        return <PaymentPage clientSecret={clientSecret} amount={paymentAmount} onSuccess={handlePaymentSuccess} onBack={() => setPage('payment_options')} />;
      case 'gifting':
        return <GiftingPage giftDetails={giftDetails} setGiftDetails={setGiftDetails} onNext={() => setPage('editor')} onBack={() => page === 'payment_options' ? setPage('payment_options') : setPage('home')} />;
      case 'editor': {
        const editorBackTarget = includesGift ? 'gifting' : (purchaseType === 'pass_active' ? 'home' : 'payment_options');
        return <CardEditor cardDetails={cardDetails} setCardDetails={setCardDetails} onNext={handleFinishEditing} onBack={() => setPage(editorBackTarget)} cardRef={cardRef} giftDetails={giftDetails} includesGift={includesGift} />;
      }
      case 'final':
        return <FinalCardPage finalCardUrl={finalCardUrl} onStartOver={handleStartOver} userId={userId} />;
      case 'account':
        return <AccountPage history={purchaseHistory} pass={activePass} onBack={() => setPage('home')} shareCount={shareCount} referralCredits={referralCredits} checkReferralRewards={() => {}} />;
      default:
        return <HomePage onStartFlow={handleStartFlow} onShowAccount={() => setPage('account')} />;
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      {isDemoMode && <div className="bg-yellow-500 text-black text-center p-2 font-bold"><p>Demo Mode</p></div>}
      <div className="container mx-auto p-4 max-w-2xl">
        <header className="text-center my-6">
          <h1 className="text-5xl font-bold text-pink-400" style={{ fontFamily: "'Dancing Script', cursive" }}>AngelShare LLC</h1>
          <p className="text-gray-300 text-lg">Send money thoughtfully.</p>
        </header>
        <main className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-2xl min-h-[400px]">
          {error && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center"><p>{error}</p><button onClick={() => setError(null)} className="text-white font-bold">X</button></div>
            </div>
          )}
          {renderPage()}
        </main>
        <footer className="text-center text-gray-500 text-xs mt-8 pb-4">
          <p>© {new Date().getFullYear()} AngelShare LLC. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
