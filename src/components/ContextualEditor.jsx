import React, { useState } from 'react';
import { SketchPicker } from 'react-color';

// --- Reusable Helper Components from CardEditor ---
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

const Slider = ({ label, name, min, max, step = '1', value, onChange }) => (
  React.createElement('div', { className: 'flex-1' },
    React.createElement('label', { className: 'block text-gray-300 text-xs font-bold mb-1', htmlFor: name }, label),
    React.createElement('input', { type: 'range', name: name, id: name, min: min, max: max, step: step, value: value, onChange: onChange, className: 'w-full' })
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


// --- Main Menu Component ---
export const ContextualMenu = ({ onSelectTool }) => {
  const tools = ['Font', 'Color', 'Size', 'Weight', 'Plaque Blur', 'Plaque Size'];

  return (
    <div className="absolute top-0 right-0 bg-gray-800 rounded-lg shadow-lg p-2 z-20 w-48">
      <p className="text-xs text-gray-400 mb-2 font-bold text-center">EDITING TOOLS</p>
      <div className="grid grid-cols-2 gap-1">
        {tools.map(tool => (
          <button
            key={tool}
            onClick={() => onSelectTool(tool)}
            className="bg-gray-700 hover:bg-pink-600 text-white text-xs font-bold py-2 px-2 rounded"
          >
            {tool}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Popover for Individual Controls ---
export const ControlPopover = ({ tool, details, element, onStyleChange, onPlaqueChange, onColorChange, onClose }) => {
  if (!tool) return null;

  const prefix = element; // 'occasion' or 'message'

  const renderControl = () => {
    switch (tool) {
      case 'Font':
        return <FontSelector value={details[`${prefix}Font`]} onChange={(e) => onStyleChange(prefix, 'Font', e.target.value)} />;
      case 'Color':
        return <ColorPicker label="Text Color" value={details[`${prefix}Color`]} onChange={(c) => onColorChange(prefix, c.hex)} />;
      case 'Size':
        return <Slider label="Text Size" name="FontSize" min="12" max={prefix === 'occasion' ? 96 : 48} value={details[`${prefix}FontSize`]} onChange={(e) => onStyleChange(prefix, 'FontSize', e.target.value)} />;
      case 'Weight':
        return <Slider label="Font Weight" name="FontWeight" min="100" max="900" step="100" value={details[`${prefix}FontWeight`]} onChange={(e) => onStyleChange(prefix, 'FontWeight', e.target.value)} />;
      case 'Plaque Blur':
        return <Slider label="Blur Intensity" name="PlaqueBlur" min="0" max="40" value={details.plaqueDetails[prefix].blur} onChange={(e) => onPlaqueChange(prefix, 'blur', e.target.value)} />;
      case 'Plaque Size':
        return <Slider label="Effect Size" name="PlaqueSize" min="0" max="100" value={details.plaqueDetails[prefix].size} onChange={(e) => onPlaqueChange(prefix, 'size', e.target.value)} />;
      default:
        return null;
    }
  };

  return (
    <div className="absolute top-full mt-2 bg-gray-900 rounded-lg shadow-xl p-4 z-30 w-56">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-bold text-pink-400">{tool}</h4>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
      </div>
      {renderControl()}
    </div>
  );
};
