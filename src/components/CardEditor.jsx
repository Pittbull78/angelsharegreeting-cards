import React, { useState, useEffect, useRef } from 'react';
import { SketchPicker } from 'react-color';

// --- DATA ---
const holidayTemplates = {
  valentines: { greetingText: 'Happy Valentine\'s Day', message: 'Sending you all my love!', occasionColor: '#d83b8c', background: 'linear-gradient(to top, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)' },
  christmas: { greetingText: 'Merry Christmas', message: 'Wishing you a joyful holiday season!', occasionColor: '#c41e3a', background: 'linear-gradient(to top, #0ba360 0%, #3cba92 100%)' },
  'new-year': { greetingText: 'Happy New Year', message: 'Cheers to a great year ahead!', occasionColor: '#f1c40f', background: 'linear-gradient(to right, #434343 0%, black 100%)' },
  'mothers-day': { greetingText: 'Happy Mother\'s Day', message: 'Thank you for everything!', occasionColor: '#ea80fc', background: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)' },
  'fathers-day': { greetingText: 'Happy Father\'s Day', message: 'You\'re the best, Dad!', occasionColor: '#3498db', background: 'linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)' },
};

const backgrounds = [
  'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(to right, #ff8177 0%, #ff867a 0%, #ff8c7f 21%, #f99185 52%, #cf556c 78%, #b12a5b 100%)',
  'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(to right, #f83600 0%, #f9d423 100%)',
  'linear-gradient(to top, #48c6ef 0%, #6f86d6 100%)',
  'linear-gradient(to right, #fa709a 0%, #fee140 100%)',
];

// --- HELPER COMPONENTS ---
const ColorPicker = ({ label, value, onChange }) => {
  const [display, setDisplay] = useState(false);
  const styles = {
    swatch: { padding: '5px', background: '#fff', borderRadius: '1px', boxShadow: '0 0 0 1px rgba(0,0,0,.1)', display: 'inline-block', cursor: 'pointer' },
    color: { width: '36px', height: '14px', borderRadius: '2px', background: value },
    popover: { position: 'absolute', zIndex: '2', bottom: '100%', left: '0' },
    cover: { position: 'fixed', top: '0px', right: '0px', bottom: '0px', left: '0px' },
  };
  return React.createElement('div', { className: 'relative' },
    React.createElement('label', { className: 'block text-gray-300 text-xs font-bold mb-1' }, label),
    React.createElement('div', { style: styles.swatch, onClick: () => setDisplay(!display) }, React.createElement('div', { style: styles.color })),
    display ? React.createElement('div', { style: styles.popover }, React.createElement('div', { style: styles.cover, onClick: () => setDisplay(false) }), React.createElement(SketchPicker, { color: value, onChange: onChange })) : null
  );
};

const Slider = ({ label, name, min, max, value, onChange }) => (
  React.createElement('div', { className: 'flex-1' },
    React.createElement('label', { className: 'block text-gray-300 text-xs font-bold mb-1', htmlFor: name }, label),
    React.createElement('input', { type: 'range', name: name, id: name, min: min, max: max, value: value, onChange: onChange, className: 'w-full' })
  )
);

const FontSelector = ({ value, onChange }) => (
  React.createElement('div', { className: 'flex-1' },
    React.createElement('label', { className: 'block text-gray-300 text-xs font-bold mb-1', htmlFor: 'font' }, 'Font'),
    React.createElement('select', { name: 'font', id: 'font', value: value, onChange: onChange, className: 'w-full bg-gray-700 text-white p-2 rounded border border-gray-600 text-sm' },
      React.createElement('option', { value: "'Dancing Script', cursive" }, 'Dancing Script'),
      React.createElement('option', { value: "'Lobster', cursive" }, 'Lobster'),
      React.createElement('option', { value: "'Pacifico', cursive" }, 'Pacifico'),
      React.createElement('option', { value: "'Caveat', cursive" }, 'Caveat'),
      React.createElement('option', { value: "'Inter', sans-serif" }, 'Inter')
    )
  )
);

const TextEditorToolbar = ({ element, details, onStyleChange, onColorChange, onClose }) => {
  const prefix = element === 'occasion' ? 'occasion' : 'message';
  const font = details[`${prefix}Font`];
  const fontSize = details[`${prefix}FontSize`];
  const fontWeight = details[`${prefix}FontWeight`];
  const color = details[`${prefix}Color`];

  return React.createElement('div', { className: 'absolute bottom-0 left-0 right-0 bg-gray-800 p-2 rounded-t-lg shadow-lg animate-fadeInUp' },
    React.createElement('div', { className: 'flex justify-between items-center mb-2' },
      React.createElement('h3', { className: 'text-sm font-bold px-2' }, `Editing ${element === 'occasion' ? 'Greeting' : 'Message'} Text`),
      React.createElement('button', { onClick: onClose, className: 'text-gray-400 hover:text-white text-2xl' }, '×')
    ),
    React.createElement('div', { className: 'space-y-2 p-2' },
      React.createElement('div', { className: 'flex space-x-4' },
        React.createElement(FontSelector, { value: font, onChange: (e) => onStyleChange(prefix, 'Font', e.target.value) }),
        React.createElement(ColorPicker, { label: 'Color', value: color, onChange: (c) => onColorChange(prefix, c.hex) })
      ),
      React.createElement(Slider, { label: 'Size', name: 'FontSize', min: '12', max: element === 'occasion' ? 96 : 48, value: fontSize, onChange: (e) => onStyleChange(prefix, 'FontSize', e.target.value) }),
      font.includes('Inter') && React.createElement(Slider, { label: 'Weight', name: 'FontWeight', min: '100', max: '900', step: '100', value: fontWeight, onChange: (e) => onStyleChange(prefix, 'FontWeight', e.target.value) })
    )
  );
};

// --- MAIN COMPONENT ---
export default function CardEditor({ cardDetails, setCardDetails, onNext, onBack, cardRef }) {
  const [selectedElement, setSelectedElement] = useState(null);

  useEffect(() => {
    const template = holidayTemplates[cardDetails.occasion];
    if (template) {
      setCardDetails(prev => ({
        ...prev,
        greetingText: template.greetingText,
        message: template.message,
        occasionColor: template.occasionColor,
        background: template.background,
        ...(prev.areColorsLinked && { messageColor: template.occasionColor })
      }));
    }
  }, [cardDetails.occasion, setCardDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleStyleChange = (prefix, name, value) => {
    setCardDetails(prev => ({ ...prev, [`${prefix}${name}`]: value }));
  };

  const handleColorChange = (prefix, color) => {
    setCardDetails(prev => ({ ...prev, [`${prefix}Color`]: color }));
  };

  const handlePhoto = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => setCardDetails(prev => ({ ...prev, photo: event.target.result, background: '' }));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const occasionStyles = { fontFamily: cardDetails.occasionFont, color: cardDetails.occasionColor, fontWeight: cardDetails.occasionFontWeight, fontSize: `${cardDetails.occasionFontSize}px` };
  const messageStyles = { fontFamily: cardDetails.messageFont, color: cardDetails.messageColor, fontWeight: cardDetails.messageFontWeight, fontSize: `${cardDetails.messageFontSize}px` };
  const senderStyles = { ...messageStyles, fontSize: `${Math.max(12, cardDetails.messageFontSize * 0.8)}px` };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div ref={cardRef} className="w-full aspect-[4/3] rounded-lg flex items-center justify-center text-center p-4 shadow-inner relative overflow-hidden" style={{ background: cardDetails.background }}>
        {cardDetails.photo && <img src={cardDetails.photo} alt="Preview" className="absolute top-0 left-0 w-full h-full object-cover" />}
        <div className="z-10 relative w-full h-full flex flex-col justify-center items-center p-4">
          <div onClick={() => setSelectedElement('occasion')} className="cursor-pointer">
            <p className="font-bold drop-shadow-md" style={occasionStyles}>{cardDetails.greetingText}</p>
          </div>
          <div onClick={() => setSelectedElement('message')} className="cursor-pointer mt-4">
            <p className="drop-shadow-md" style={messageStyles}>{cardDetails.message}</p>
            <p className="italic drop-shadow-md mt-6" style={senderStyles}>from {cardDetails.sender}</p>
          </div>
        </div>
      </div>

      {selectedElement && <TextEditorToolbar element={selectedElement} details={cardDetails} onStyleChange={handleStyleChange} onColorChange={handleColorChange} onClose={() => setSelectedElement(null)} />}

      <div className="space-y-4">
        <div>
          <label className="block text-gray-300 text-sm font-bold mb-2">Card Type</label>
          <select name="occasion" value={cardDetails.occasion} onChange={handleInputChange} className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600">
            <option value="birthday">Birthday</option>
            <option value="anniversary">Anniversary</option>
            <option value="thank you">Thank You</option>
            <option value="congratulations">Congratulations</option>
            <option value="valentines">Valentine's Day</option>
            <option value="christmas">Christmas</option>
            <option value="new-year">New Year</option>
            <option value="mothers-day">Mother's Day</option>
            <option value="fathers-day">Father's Day</option>
            <option value="get-well">Get Well Soon</option>
            <option value="sympathy">Sympathy</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-bold mb-2">Greeting Text</label>
          <input type="text" name="greetingText" value={cardDetails.greetingText} onChange={handleInputChange} className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600" />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-bold mb-2">Message</label>
          <textarea name="message" value={cardDetails.message} onChange={handleInputChange} className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600" rows="3" />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-bold mb-2">From</label>
          <input type="text" name="sender" value={cardDetails.sender} onChange={handleInputChange} className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600" />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-bold mb-2">Background</label>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {backgrounds.map(bg => (
              <div key={bg} onClick={() => setCardDetails(prev => ({ ...prev, background: bg, photo: null }))} style={{ background: bg }} className="w-12 h-12 rounded border-2 border-transparent hover:border-pink-500 cursor-pointer flex-shrink-0"></div>
            ))}
            <label htmlFor="photo-upload" className="w-12 h-12 rounded border-2 border-gray-600 hover:border-pink-500 cursor-pointer flex-shrink-0 flex items-center justify-center text-gray-400 text-2xl">+</label>
            <input type="file" id="photo-upload" accept="image/*" onChange={handlePhoto} className="hidden" />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">Back</button>
        <button onClick={onNext} className="w-auto bg-green-600 hover:bg-green-700 text-white font-bold">Finish & Create Card</button>
      </div>
    </div>
  );
}