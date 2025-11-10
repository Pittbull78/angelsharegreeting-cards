import React, { useState, useEffect, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
// Use the local packages installed via npm


import HomePage from './components/HomePage';
import PaymentOptionsPage from './components/PaymentOptionsPage';
import LoadingSpinner from './components/LoadingSpinner';
import PaymentPage from './components/PaymentPage';
import GiftingPage from './components/GiftingPage';
import CardEditor from './components/CardEditor';
import FinalCardPage from './components/FinalCardPage';
import AccountPage from './components/AccountPage';

// --- CONFIGURATION ---
// IMPORTANT: Replace with your ACTUAL LIVE Publishable Key from Stripe
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY; // Replace!
// IMPORTANT: Replace with your ACTUAL LIVE Backend URL from Vercel
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;



// --- Pricing (Your new V2.0 Prices) ---
import { PRICES } from './prices';

// Use the local packages installed via npm


import HomePage from './components/HomePage';
import PaymentOptionsPage from './components/PaymentOptionsPage';
import LoadingSpinner from './components/LoadingSpinner';
import PaymentPage from './components/PaymentPage';
import GiftingPage from './components/GiftingPage';
import CardEditor from './components/CardEditor';
import FinalCardPage from './components/FinalCardPage';
import AccountPage from './components/AccountPage';

// --- CONFIGURATION ---
// IMPORTANT: Replace with your ACTUAL LIVE Publishable Key from Stripe
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY; // Replace!
// IMPORTANT: Replace with your ACTUAL LIVE Backend URL from Vercel
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;



// --- Pricing (Your new V2.0 Prices) ---
import { PRICES } from './prices';

// --- Main App Component (The "CEO's Office") ---
export default function App() {
  // 'page' state controls what the user sees
  const [page, setPage] = useState('home'); // 'home', 'gifting', 'editor', 'payment_options', 'payment', 'final', 'account'
  const [purchaseType, setPurchaseType] = useState(null); // 'single', 'pass'
  const [includesGift, setIncludesGift] = useState(false); // Does this card include a monetary gift?

  // State for the data we collect
  const [giftDetails, setGiftDetails] = useState({ amount: 25, username: '', platform: 'cashapp', recipient: '' });
  const [cardDetails, setCardDetails] = useState({
    // Card Content
    occasion: 'birthday',
    greetingText: 'Birthday',
    message: '',
    sender: '',
    photo: null,
    background: 'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)',

    // Greeting (Occasion) Styles
    occasionFont: '\'Dancing Script\', cursive',
    occasionFontWeight: 700,
    occasionFontSize: 48,
    occasionColor: '#FFFFFF',

    // Message Styles
    messageFont: '\'Inter\', sans-serif',
    messageFontWeight: 400,
    messageFontSize: 20,
    messageColor: '#FFFFFF',

    // Color Linking
    areColorsLinked: true,

    // Per-element plaque details
    plaqueDetails: {
      occasion: { blur: 0, size: 70 },
      message: { blur: 0, size: 80 },
    }
  });

  // State for payment history and passes
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [activePass, setActivePass] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [userId, setUserId] = useState(null);
  const [shareCount, setShareCount] = useState(0);
  const [referralCredits, setReferralCredits] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // State for the final generated card
  const [finalCardUrl, setFinalCardUrl] = useState('');

  // State for the Stripe Payment Element
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [error, setError] = useState(null);
  const cardRef = useRef();

  // --- On App Load: Load history from localStorage ---
  useEffect(() => {
    try {
      // Check for Demo Mode
      const urlParams = new URLSearchParams(window.location.search);
      if (import.meta.env.DEV && urlParams.get('demo') === 'true') {
        setIsDemoMode(true);
      }

      // User ID
      let storedUserId = localStorage.getItem('angelshareUserId');
      if (!storedUserId) {
        storedUserId = `user_${new Date().getTime()}`;
        localStorage.setItem('angelshareUserId', storedUserId);
      }
      setUserId(storedUserId);

      // Share Count
      const storedShareCount = parseInt(localStorage.getItem('angelshareShareCount') || '0', 10);
      setShareCount(storedShareCount);

      // Referral Credits
      const storedReferralCredits = parseInt(localStorage.getItem('angelshareReferralCredits') || '0', 10);
      setReferralCredits(storedReferralCredits);

      const history = JSON.parse(localStorage.getItem('angelshareHistory') || '[]');
      setPurchaseHistory(history);

      // Referral Check
      const referrerId = urlParams.get('ref');

      if (history.length === 0) {
        if (referrerId) {
          // New user with a referral
          setIsNewUser(true);
          setActivePass({ id: 'free_card_referred', type: 'Free Card (Referred)', count: 2 });
        } else {
          // New user, no referral
          setIsNewUser(true);
          setActivePass({ id: 'free_card', type: 'Free Card', count: 1 });
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
      localStorage.removeItem('angelshareHistory');
      localStorage.removeItem('angelshareUserId');
      localStorage.removeItem('angelshareShareCount');
      localStorage.removeItem('angelshareReferralCredits');
    }
  }, []);

  // --- Page Navigation Handlers ---

  // 1. User on Home page, clicks "Send a Monetary Greeting" or "Send a Digital Card"
  const handleStartFlow = (type) => { // 'gift' or 'card'
    setIncludesGift(type === 'gift');

    if (activePass) {
      if (activePass.id && activePass.id.startsWith('free_card')) {
        setPurchaseType('free_card');
      } else {
        setPurchaseType('pass_active');
      }
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

  // 2. User on Payment Options, clicks "$3 Single" or "$8 Pass"
  const handleSelectPurchase = (type) => { // 'single' or 'pass'
    setPurchaseType(type);

    if (isDemoMode) {
      handlePaymentSuccess();
      return;
    }

    const amount = type === 'single' ? PRICES.SINGLE_CARD : PRICES.THIRTY_DAY_PASS;
    setPaymentAmount(amount);

    // Go create the Payment Intent on the backend
    fetchPaymentIntent(amount);
  };

  // 3. Helper function to talk to your backend
  const fetchPaymentIntent = (amount) => {
     // Show a loading spinner or state here
     setPage('loading'); // Add a loading state
    console.log('Using backend URL:', BACKEND_URL);
    fetch(`${BACKEND_URL}/api/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Math.round(amount * 100) }) // Stripe needs cents
    })
    .then(res => {
      if (!res.ok) {
        // If we get a 404, 500, etc.
        return res.json().then(err => { throw new Error(err.error || `Server error: ${res.status}`) });
      }
      return res.json();
    })
    .then(data => {
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setPage('payment'); // Go to the actual payment screen
      } else {
        throw new Error("Invalid response from server (missing clientSecret).");
      }
    })
    .catch(err => {
        setError(`Error: Could not initialize payment. \n${err.message}\nPlease check your backend connection and Vercel logs, then try again.`);
        console.error("Fetch Payment Intent Error:", err);
        setPage('payment_options'); // Go back if failed
    });
  };

  // 4. After a successful payment
  const handlePaymentSuccess = () => {
    const now = new Date();
    let newPurchase;

    if (purchaseType === 'pass') {
      const expiryTime = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
      newPurchase = {
        id: now.getTime(),
        type: '30-Day Pass',
        date: now.toLocaleDateString(),
        amount: PRICES.THIRTY_DAY_PASS,
        expires: expiryTime.getTime(),
        expiresString: expiryTime.toLocaleDateString()
      };
      setActivePass(newPurchase);
    } else { // 'single'
      newPurchase = {
        id: now.getTime(),
        type: 'Single Card',
        date: now.toLocaleDateString(),
        amount: PRICES.SINGLE_CARD
      };
    }

    // Update history
    const newHistory = [...purchaseHistory, newPurchase];
    setPurchaseHistory(newHistory);
    localStorage.setItem('angelshareHistory', JSON.stringify(newHistory));

    // Move to the next step
    if (includesGift) {
      setPage('gifting');
    } else {
      setPage('editor');
    }
  };

  // 5. After finishing card editing
  const handleFinishEditing = async () => {
    setPage('loading'); // Show a spinner while generating the image
    if (!cardRef.current) {
      setError("An error occurred while creating the card. Please try again.");
      setPage('editor');
      return;
    }

    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, { cacheBust: true });
      setFinalCardUrl(dataUrl);

      // --- Update purchase history (existing logic) ---
      if (purchaseType === 'free_card' && activePass && activePass.count > 0) {
        const newCount = activePass.count - 1;
        const now = new Date();
        const newPurchase = {
          id: now.getTime(),
          type: activePass.type,
          date: now.toLocaleDateString(),
          amount: 0,
        };
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
        const now = new Date();
        const newPurchase = {
          id: now.getTime(),
          type: 'Referral Credit Used',
          date: now.toLocaleDateString(),
          amount: 0,
        };
        const newHistory = [...purchaseHistory, newPurchase];
        setPurchaseHistory(newHistory);
        localStorage.setItem('angelshareHistory', JSON.stringify(newHistory));
      }
      
      setPage('final'); // Navigate to the final page

    } catch (error) {
      console.error("Card generation error:", error);
      setError("Sorry, there was an issue creating your card image. Please try again.");
      setPage('editor'); // Go back to the editor on failure
    }
  };

  // 6. Reset the app flow
  const handleStartOver = () => {
    setPage('home');
    setIncludesGift(false);
    setGiftDetails({ amount: 25, username: '', platform: 'cashapp', recipient: '' });
    setCardDetails({
      occasion: 'birthday',
      greetingText: 'Birthday',
      message: '',
      sender: '',
      photo: null,
      background: 'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)',
      occasionFont: '\'Dancing Script\', cursive',
      occasionFontWeight: 700,
      occasionFontSize: 48,
      occasionColor: '#FFFFFF',
      messageFont: '\'Inter\', sans-serif',
      messageFontWeight: 400,
      messageFontSize: 20,
      messageColor: '#FFFFFF',
      areColorsLinked: true,
    });
    setClientSecret(null);
    setPaymentAmount(0);
    setError(null);
  };

  // --- QR Code Generation Logic ---
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

  const handleCheckReferralRewards = () => {
    if (shareCount >= 5 && purchaseHistory.length > 0) {
      // Grant a free card
      const newCredits = referralCredits + 1;
      setReferralCredits(newCredits);
      localStorage.setItem('angelshareReferralCredits', newCredits);
      alert('Congratulations! You have earned a free card for sharing!');
    } else {
      alert('You have not met the conditions for a referral reward yet. Keep sharing!');
    }
  };

  // --- Main Render Function (The "Router") ---
  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage onStartFlow={handleStartFlow} onShowAccount={() => setPage('account')} isNewUser={isNewUser} activePass={activePass} />;
      case 'payment_options':
        return <PaymentOptionsPage onSelectPurchase={handleSelectPurchase} onBack={() => setPage('home')} />;
      case 'loading': // Added loading state
        return <LoadingSpinner message="Initializing payment..." />;
      case 'payment':
        return (
          <PaymentPage
            clientSecret={clientSecret}
            amount={paymentAmount}
            onSuccess={handlePaymentSuccess}
            // Add onBack prop if needed, e.g., to go back to payment_options
            onBack={() => setPage('payment_options')}
          />
        );
      case 'gifting':
        return <GiftingPage giftDetails={giftDetails} setGiftDetails={setGiftDetails} onNext={() => setPage('editor')} onBack={() => page === 'payment_options' ? setPage('payment_options') : setPage('home')} />;
      case 'editor': {
        // Determine where 'Back' should go based on the flow
        const editorBackTarget = includesGift ? 'gifting' : (purchaseType === 'pass_active' ? 'home' : 'payment_options');
        return <CardEditor 
          cardDetails={cardDetails} 
          setCardDetails={setCardDetails} 
          onNext={handleFinishEditing} 
          onBack={() => setPage(editorBackTarget)} 
          cardRef={cardRef}
          giftDetails={giftDetails}
          includesGift={includesGift}
        />;
      }
      case 'final':
        return <FinalCardPage cardDetails={cardDetails} giftDetails={giftDetails} onStartOver={handleStartOver} userId={userId} />;
      case 'account':
        return <AccountPage history={purchaseHistory} pass={activePass} onBack={() => setPage('home')} shareCount={shareCount} referralCredits={referralCredits} checkReferralRewards={handleCheckReferralRewards} />;
      default:
        return <HomePage onStartFlow={handleStartFlow} onShowAccount={() => setPage('account')} />;
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      {isDemoMode && (
        <div className="bg-yellow-500 text-black text-center p-2 font-bold">
          <p>Demo Mode</p>
        </div>
      )}
      <div className="container mx-auto p-4 max-w-2xl">
        <header className="text-center my-6">
          <h1 className="text-5xl font-bold text-pink-400" style={{ fontFamily: "'Dancing Script', cursive" }}>
            AngelShare LLC
          </h1>
          <p className="text-gray-300 text-lg">Send money thoughtfully.</p>
        </header>

        <main className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-2xl min-h-[400px]">
          {error && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <p>{error}</p>
                <button onClick={() => setError(null)} className="text-white font-bold">X</button>
              </div>
            </div>
          )}
          {renderPage()}
        </main>

        <footer className="text-center text-gray-500 text-xs mt-8 pb-4">
          <p>© {new Date().getFullYear()} AngelShare LLC. All rights reserved.</p>
          <p className="mt-2 px-4">
            The content provided by this greeting card application is for informational and entertainment purposes only. While we strive for accuracy, we cannot guarantee the completeness or reliability of the information presented.
            By using this app, you acknowledge and agree that any reliance on the material is at your own risk. We will not be liable for any losses, injuries, or damages arising from the use of this app or the information contained therein.
            All greeting card designs, messages, and artwork are the intellectual property of their respective owners. Unauthorized use or reproduction is strictly prohibited. Additionally, the app may contain links to external websites; we do not endorse or assume any responsibility for the content or practices of these sites.
            Please ensure that all messages and content shared through this app comply with applicable laws and regulations. We can encourage users to exercise discretion and sensitivity when sending messages or cards to others.
            Use of this app constitutes acceptance of these terms. If you do not agree with these terms, please do not use the application.
          </p>
        </footer>
      </div>
    </div>
  );
}

