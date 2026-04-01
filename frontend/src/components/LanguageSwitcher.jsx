import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../slices/languageSlice';
import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'az', label: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'ru', label: 'Русский',    flag: '🇷🇺' },
  { code: 'tr', label: 'Türkçe',     flag: '🇹🇷' },
];

export default function LanguageSwitcher() {
  const dispatch = useDispatch();
  const currentLang = useSelector((state) => state.language.currentLang);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const current = languages.find((l) => l.code === currentLang) || languages[0];

  // Xaricdə klik olunanda bağla
  useEffect(() => {
    const fn = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>

      {/* ── Düymə: yalnız dünya ikonu ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={current.label}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 38,
          height: 38,
          borderRadius: 11,
          border: 'none',
          background: isOpen ? '#fff0f1' : 'transparent',
          cursor: 'pointer',
          color: isOpen ? '#E8192C' : '#444',
          transition: 'all 0.18s',
          position: 'relative',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#fff0f1';
          e.currentTarget.style.color = '#E8192C';
        }}
        onMouseLeave={e => {
          if (!isOpen) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#444';
          }
        }}
      >
        <Globe size={19} />
        {/* Seçilmiş dilin kiçik bayrağı — düymənin sağ alt küncündə */}
        <span style={{
          position: 'absolute',
          bottom: 2,
          right: 2,
          fontSize: 9,
          lineHeight: 1,
          userSelect: 'none',
        }}>
          {current.flag}
        </span>
      </button>

      {/* ── Dropdown ── */}
      {isOpen && (
        <ul
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            background: '#fff',
            border: '1px solid #f0f0f0',
            borderRadius: 13,
            listStyle: 'none',
            margin: 0,
            padding: '5px 0',
            minWidth: 175,
            boxShadow: '0 8px 28px rgba(0,0,0,0.11)',
            zIndex: 1000,
            animation: 'lsIn 0.15s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          <style>{`
            @keyframes lsIn {
              from { opacity: 0; transform: translateY(-6px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0)    scale(1);    }
            }
          `}</style>

          {languages.map((lang) => {
            const isActive = currentLang === lang.code;
            return (
              <li
                key={lang.code}
                onClick={() => {
                  dispatch(setLanguage(lang.code));
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 14px',
                  cursor: 'pointer',
                  fontFamily: "'Sora', sans-serif",
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#E8192C' : '#333',
                  background: isActive ? '#fff0f1' : 'transparent',
                  transition: 'background 0.13s',
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = '#f9f9f9';
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* Bayraq */}
                <span style={{ fontSize: 20, lineHeight: 1 }}>{lang.flag}</span>

                {/* Dil adı */}
                <span style={{ flex: 1 }}>{lang.label}</span>

                {/* Kod: AZ, EN, RU, TR */}
                <span style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: isActive ? '#E8192C' : '#bbb',
                  letterSpacing: '0.05em',
                  background: isActive ? '#fde8ea' : '#f4f4f4',
                  borderRadius: 6,
                  padding: '2px 6px',
                  fontFamily: "'Sora', sans-serif",
                }}>
                  {lang.code.toUpperCase()}
                </span>

                {/* Aktiv işarəsi */}
                {isActive && (
                  <span style={{ fontSize: 13, color: '#E8192C' }}>✓</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}