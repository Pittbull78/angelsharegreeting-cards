import React, { useState, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import CardEditor from './CardEditor';

// --- Mock Data and Functions ---
const initialCardDetails = {
  occasion: 'birthday',
  greetingText: 'Happy Birthday',
  message: 'Have a great day!',
  sender: 'A Friend',
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
    occasion: { blur: 8, size: 70 },
    message: { blur: 8, size: 80 },
  }
};

export default function CardCreationTest() {
  const [cardDetails, setCardDetails] = useState(initialCardDetails);
  const [generatedCardUrl, setGeneratedCardUrl] = useState('');
  const cardRef = useRef();

  // This is the function we will be testing and refining.
  const handleTestCreateCard = () => {
    if (!cardRef.current) {
      alert('Card element not found. Cannot generate image.');
      return;
    }

    console.log('Generating card image from ref:', cardRef.current);

    htmlToImage.toPng(cardRef.current, { cacheBust: true })
      .then((dataUrl) => {
        console.log('Successfully generated card image data URL.');
        setGeneratedCardUrl(dataUrl);
      })
      .catch((err) => {
        console.error('Image generation failed:', err);
        alert('Oops, something went wrong! Could not generate the card image.');
      });
  };

  const handleReset = () => {
    setCardDetails(initialCardDetails);
    setGeneratedCardUrl('');
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-2xl">
      <h2 className="text-2xl font-bold text-yellow-400 mb-4 border-b-2 border-yellow-400 pb-2">Card Creation Test Environment</h2>
      <p className="text-gray-300 mb-4">
        Modify the card below. When you click "Finish & Create Card", the image will be generated and displayed at the bottom.
      </p>

      {/* --- The Component Being Tested --- */}
      <CardEditor
        cardDetails={cardDetails}
        setCardDetails={setCardDetails}
        onNext={handleTestCreateCard} // We use our test function here
        onBack={() => alert('Back button clicked!')} // Mocked
        cardRef={cardRef}
      />

      {/* --- Test Controls & Output --- */}
      <div className="mt-6">
        <button onClick={handleReset} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">
          Reset Test
        </button>
      </div>

      {generatedCardUrl && (
        <div className="mt-8 pt-6 border-t-2 border-gray-700">
          <h3 className="text-xl font-bold text-green-400 mb-4">Generated Card Image:</h3>
          <img src={generatedCardUrl} alt="Generated Card" className="w-full aspect-[4/3] rounded-lg shadow-lg" />
          <div className="mt-4">
            <a
              href={generatedCardUrl}
              download="test-card.png"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Download Test Image
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
