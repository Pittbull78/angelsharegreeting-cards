import React from 'react';

// --- Loading Spinner Component ---
export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center h-40 animate-fadeIn">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-400 mb-4"></div>
      <p className="text-gray-300">{message}</p>
    </div>
  );
}