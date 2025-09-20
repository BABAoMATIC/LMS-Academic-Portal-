import React, { useEffect, useRef } from 'react';
import { theme } from '../utils/theme';

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface LanguageSelectorProps {
  languages: Language[];
  currentLanguage: string;
  onLanguageChange: (languageCode: string) => void;
  onClose: () => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  languages,
  currentLanguage,
  onLanguageChange,
  onClose,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        width: '200px',
        backgroundColor: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: theme.borderRadius.lg,
        boxShadow: theme.shadows.xl,
        zIndex: theme.zIndex.dropdown,
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: theme.spacing.sm }}>
        <h4
          style={{
            margin: 0,
            marginBottom: theme.spacing.sm,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text.secondary,
          }}
        >
          Select Language
        </h4>
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => onLanguageChange(language.code)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm,
              padding: theme.spacing.sm,
              background: language.code === currentLanguage 
                ? `${theme.colors.primary}20` 
                : 'transparent',
              border: 'none',
              borderRadius: theme.borderRadius.md,
              color: language.code === currentLanguage 
                ? theme.colors.primary 
                : theme.colors.text.primary,
              cursor: 'pointer',
              fontSize: theme.typography.fontSize.sm,
              transition: `all ${theme.transitions.duration.normal} ${theme.transitions.easing.ease}`,
            }}
            onMouseEnter={(e) => {
              if (language.code !== currentLanguage) {
                e.currentTarget.style.backgroundColor = theme.colors.background.tertiary;
              }
            }}
            onMouseLeave={(e) => {
              if (language.code !== currentLanguage) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: '1.2em' }}>{language.flag}</span>
            <span>{language.name}</span>
            {language.code === currentLanguage && (
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.primary,
                }}
              >
                ✓
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
