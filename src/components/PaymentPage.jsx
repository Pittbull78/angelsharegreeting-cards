import React, { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import LoadingSpinner from './LoadingSpinner';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// This is the main payment form wrapper
export default function PaymentPage({ clientSecret, amount, onSuccess, onBack }) { // Added onBack
  const options = {
    clientSecret,
    appearance: {
      theme: 'night',
      labels: 'floating',
      variables: {
        colorPrimary: '#f472b6', // pink-400
        colorBackground: '#374151', // gray-700
        colorText: '#ffffff',
        colorDanger: '#f87171', // red-400
        fontFamily: 'Inter, sans-serif',
        borderRadius: '8px',
      }
    },
  };

  return (
    <div className="animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
             <h2 className="text-2xl font-bold">Complete Your Purchase</h2>
             <button onClick={onBack} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </div>

      <p className="text-center text-4xl font-bold mb-6">${amount.toFixed(2)}</p>

      {clientSecret ? (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm
            onSuccess={onSuccess}
            purchaseAmount={amount}
          />
        </Elements>
      ) : (
          // This should ideally not be shown if loading state is handled
           <LoadingSpinner message="Error: Could not load payment form." />
      )}
    </div>
  );
}

// This is the actual form that uses Stripe's hooks
function CheckoutForm({ onSuccess, purchaseAmount }) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }
    // Retrieve the PaymentIntent client secret if needed, though it's passed via options
    // const clientSecret = new URLSearchParams(window.location.search).get(
    //   "payment_intent_client_secret"
    // );
    // if (!clientSecret) {
    //   return;
    // }
    // stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
    //   switch (paymentIntent.status) {
    //     case "succeeded":
    //       setMessage("Payment succeeded!");
    //       break;
    //     // Handle other statuses
    //   }
    // });
  }, [stripe]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.log("Stripe.js not loaded yet.");
      setMessage("Payment gateway is still loading. Please wait a moment.");
      return; // Stripe.js has not yet loaded.
    }

    setIsLoading(true);
    setMessage(null); // Clear previous messages

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required' // We handle success/failure here
    });

    console.log("confirmPayment result:", { error, paymentIntent });

    if (error) {
      console.error("Stripe confirmPayment error:", error);
      setMessage(error.message || "An unexpected error occurred during payment.");
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setMessage("Payment Successful!");
      setTimeout(() => {
         onSuccess(); // Call the parent component's success handler
      }, 1500); // Give user time to see success message
      // No need to setIsLoading(false) if we navigate away
      return; // Exit early on success
    } else if (paymentIntent && paymentIntent.status === 'processing') {
      setMessage('Payment is processing. We will notify you upon completion.');
      // Keep loading spinner? Or allow retry? For now, keep loading.
    } else if (paymentIntent) {
       setMessage(`Payment status: ${paymentIntent.status}. Please try again or contact support.`);
    } else {
       setMessage('An unexpected issue occurred. Payment intent not found. Please try again.');
    }

    setIsLoading(false); // Only set false if not successful or still processing and allowing retry
  };

  const paymentElementOptions = {
    layout: "tabs",
    wallets: {
      applePay: 'auto',
      googlePay: 'auto'
    },
    // Show all payment methods for both prices now
    paymentMethodOrder: ['apple_pay', 'google_pay', 'cashapp', 'venmo', 'card']
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" options={paymentElementOptions} className="mb-4" />

      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all duration-200 mt-6 disabled:opacity-50 disabled:cursor-wait"
      >
        <span id="button-text">
          {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto" /> : `Pay $${purchaseAmount.toFixed(2)}`}
        </span>
      </button>

      {/* Show any error or success messages */}
      {message && <div id="payment-message" className={`mt-4 text-center font-bold ${message.includes('Successful') ? 'text-green-400' : 'text-red-400'}`}>{message}</div>}
    </form>
  );
}