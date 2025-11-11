import React, { useState, useEffect, useRef } from 'react';
import { SketchPicker } from 'react-color';

// --- DATA ---
const holidayTemplates = {
  birthday: { greetingText: 'Happy Birthday', message: 'Wishing you the best on your special day!', occasionColor: '#4a2c2a', background: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)' },
  anniversary: { greetingText: 'Happy Anniversary', message: 'Cheers to another year together!', occasionColor: '#FFFFFF', background: 'linear-gradient(to right, #ff8177 0%, #ff867a 0%, #ff8c7f 21%, #f99185 52%, #cf556c 78%, #b12a5b 100%)' },
  'thank you': { greetingText: 'Thank You', message: 'I really appreciate your kindness!', occasionColor: '#001f3f', background: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)' },
  congratulations: { greetingText: 'Congratulations', message: 'You did it! So proud of you.', occasionColor: '#441288', background: 'linear-gradient(to right, #f83600 0%, #f9d423 100%)' },
  'get-well': { greetingText: 'Get Well Soon', message: 'Sending you healing thoughts.', occasionColor: '#FFFFFF', background: 'linear-gradient(to top, #48c6ef 0%, #6f86d6 100%)' },
  sympathy: { greetingText: 'With Sympathy', message: 'Thinking of you during this difficult time.', occasionColor: '#333333', background: 'linear-gradient(to right, #e2e2e2 0%, #c9d6ff 100%)' },
  valentines: { greetingText: 'Happy Valentine\'s Day', message: 'Sending you all my love!', occasionColor: '#c2185b', background: 'linear-gradient(to top, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)' },
  christmas: { greetingText: 'Merry Christmas', message: 'Wishing you a joyful holiday season!', occasionColor: '#FFFFFF', background: 'linear-gradient(to top, #0ba360 0%, #3cba92 100%)' },
  'new-year': { greetingText: 'Happy New Year', message: 'Cheers to a great year ahead!', occasionColor: '#f1c40f', background: 'linear-gradient(to right, #434343 0%, black 100%)' },
  'mothers-day': { greetingText: 'Happy Mother\'s Day', message: 'Thank you for everything!', occasionColor: '#4a2c2a', background: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)' },
  'fathers-day': { greetingText: 'Happy Father\'s Day', message: 'You\'re the best, Dad!', occasionColor: '#FFFFFF', background: 'linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)' },
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

import { ContextualMenu, ControlPopover } from './ContextualEditor';

// --- MAIN COMPONENT ---
export default function CardEditor({ cardDetails, setCardDetails, onNext, onBack, cardRef, giftDetails, includesGift }) {
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  
  // State for manual dragging
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [relativePosition, setRelativePosition] = useState({ x: 0, y: 0 });

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

  // Drag Handlers
  const handleDragStart = (e) => {
    if (e.target.closest('button, input, select')) return;
    
    const pageX = e.pageX || e.touches[0].pageX;
    const pageY = e.pageY || e.touches[0].pageY;

    setIsDragging(true);
    setRelativePosition({
      x: pageX - position.x,
      y: pageY - position.y
    });
    e.preventDefault();
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;

    const pageX = e.pageX || e.touches[0].pageX;
    const pageY = e.pageY || e.touches[0].pageY;

    setPosition({
      x: pageX - relativePosition.x,
      y: pageY - relativePosition.y
    });
    e.preventDefault();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchend', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);


  const handleSelectElement = (element) => {
    setSelectedElement(element);
    setSelectedTool(null); // Reset tool selection when element changes
  };

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

  const handlePlaqueChange = (element, property, value) => {
    setCardDetails(prev => ({
      ...prev,
      plaqueDetails: {
        ...prev.plaqueDetails,
        [element]: {
          ...prev.plaqueDetails[element],
          [property]: value
        }
      }
    }));
  };

  const handlePhoto = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => setCardDetails(prev => ({ ...prev, photo: event.target.result, background: '' }));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const generateQrCodeUrl = (details) => {
    if (!details.username || !details.amount) return null;

    let link;
    if (details.platform === 'cashapp') {
      const cleanUsername = details.username.replace(/^\$/, '');
      link = `https://cash.app/$${cleanUsername}/${details.amount}`;
    } else { // venmo
      const cleanUsername = details.username.replace(/^@/, '');
      link = `https://venmo.com/paycharge?txn=pay&recipients=${cleanUsername}&amount=${details.amount}&note=For%20${details.recipient.replace(' ', '%20')}`;
    }
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(link)}`;
  };

  const qrCodeUrl = includesGift ? generateQrCodeUrl(giftDetails) : null;

  const occasionStyles = { fontFamily: cardDetails.occasionFont, color: cardDetails.occasionColor, fontWeight: cardDetails.occasionFontWeight, fontSize: `${cardDetails.occasionFontSize}px` };
  const messageStyles = { fontFamily: cardDetails.messageFont, color: cardDetails.messageColor, fontWeight: cardDetails.messageFontWeight, fontSize: `${cardDetails.messageFontSize}px` };
  const senderStyles = { ...messageStyles, fontSize: `${Math.max(12, cardDetails.messageFontSize * 0.8)}px` };

  const plaqueStyle = (type) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: `${cardDetails.plaqueDetails[type].size}%`,
    height: '100%',
    transform: 'translate(-50%, -50%)',
    // backdropFilter: `blur(${cardDetails.plaqueDetails[type].blur}px)`,
    // WebkitBackdropFilter: `blur(${cardDetails.plaqueDetails[type].blur}px)`,
    maskImage: 'radial-gradient(ellipse 50% 60% at 50% 50%, black 40%, transparent 100%)',
    WebkitMaskImage: 'radial-gradient(ellipse 50% 60% at 50% 50%, black 40%, transparent 100%)',
  });

  return (
    <div className="space-y-4 animate-fadeIn">
      <div ref={cardRef} className="w-full aspect-[4/3] rounded-lg flex items-center justify-center text-center p-4 shadow-inner relative overflow-hidden" style={{ background: cardDetails.background }}>
        {cardDetails.photo && <img src={cardDetails.photo} alt="Preview" className="absolute top-0 left-0 w-full h-full object-cover" />}
        
        <div className="z-10 relative w-full h-full flex flex-col justify-center items-center p-4 space-y-4">
          {/* Greeting Area */}
          <div onClick={() => handleSelectElement('occasion')} className="cursor-pointer relative w-full py-2">
            
            <p className="font-bold drop-shadow-md relative" style={occasionStyles}>{cardDetails.greetingText}</p>
          </div>

          {/* Message Area */}
          <div onClick={() => handleSelectElement('message')} className="cursor-pointer relative w-full py-4">
            
            <div className="relative">
              <p className="drop-shadow-md" style={messageStyles}>{cardDetails.message}</p>
              <p className="italic drop-shadow-md mt-6" style={senderStyles}>from {cardDetails.sender}</p>
            </div>
          </div>

          {qrCodeUrl && (
            <div className="absolute bottom-4 right-4 z-20">
              <img src={qrCodeUrl} alt="Gift QR Code" className="w-16 h-16 rounded-lg border-2 border-white shadow-lg bg-white" />
            </div>
          )}
        </div>

        {selectedElement && (
          <div 
            className="absolute top-4 right-4 z-20"
            style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <div className="cursor-move">
              <ContextualMenu onSelectTool={setSelectedTool} />
            </div>
            <ControlPopover 
              tool={selectedTool} 
              details={cardDetails}
              element={selectedElement}
              onStyleChange={handleStyleChange}
              onPlaqueChange={handlePlaqueChange}
              onColorChange={handleColorChange}
              onClose={() => setSelectedTool(null)} 
            />
          </div>
        )}
      </div>

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