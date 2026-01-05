import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

function LanguageSelector() {
  const { language, changeLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = availableLanguages.find(lang => lang.code === language);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (code: string) => {
    changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors"
        aria-label="Change language"
      >
        <span className="text-xl">{currentLanguage?.flag}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-surface-primary border border-border-default rounded-md shadow-lg z-50">
          <div className="py-1">
            {availableLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-surface-hover transition-colors ${
                  language === lang.code ? 'bg-surface-secondary' : ''
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className={`text-sm ${
                  language === lang.code ? 'text-text-primary font-medium' : 'text-text-secondary'
                }`}>
                  {lang.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;
