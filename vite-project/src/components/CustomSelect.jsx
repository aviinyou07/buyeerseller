import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  error = false,
  className = '',
  dropdownClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Normalize options to handle both strings and objects {label, value}
  const normalizedOptions = options.map(opt => 
    typeof opt === 'object' && opt !== null 
      ? opt 
      : { label: String(opt), value: String(opt) }
  );

  const selectedOption = normalizedOptions.find(opt => String(opt.value) === String(value));

  const handleSelect = (selectedValue) => {
    if (disabled) return;
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between border bg-white px-3 py-3 text-sm font-semibold text-[#102a43] outline-none transition-colors ${
          disabled ? 'cursor-not-allowed bg-slate-50 opacity-70' : 'cursor-pointer hover:border-slate-300'
        } ${error ? 'border-red-300 ring-1 ring-red-200' : 'border-slate-100'} ${className.includes('h-12') ? 'h-12 py-0' : ''}`}
      >
        <span className={`truncate ${!selectedOption ? 'text-slate-400' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className={`absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-slate-100 bg-white py-1 shadow-lg ${dropdownClassName}`}>
          {normalizedOptions.length > 0 ? (
            normalizedOptions.map((option, index) => (
              <div
                key={`${option.value}-${index}`}
                className={`cursor-pointer px-3 py-2 text-sm font-semibold transition-colors ${
                  String(option.value) === String(value)
                    ? 'bg-indigo-50 text-[#2e016e]'
                    : 'text-[#102a43] hover:bg-slate-50'
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(option.value);
                }}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-slate-400">No options available</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
