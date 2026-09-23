import React from 'react';

const ThemeToggle = ({ mode, toggleDarkMode }) => {
    // Determina se è dark per gestire le classi condizionali
    const isDark = mode === 'dark';

    return (
        <button
            onClick={toggleDarkMode}
            type="button"
            className={`
        relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
        transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600
        ${isDark ? 'bg-slate-900' : 'bg-blue-100'}
      `}
            aria-label="Toggle Dark Mode"
        >
            <span className="sr-only">Use setting</span>

            {/* Il cerchio che si muove (Knob) */}
            <span
                className={`
          pointer-events-none relative inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 
          transition duration-300 ease-in-out
          ${isDark ? 'translate-x-8' : 'translate-x-0'}
        `}
            >
        {/* Icona SOLE (Visibile solo in Light Mode) */}
                <span
                    className={`
            absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-300
            ${isDark ? 'opacity-0 ease-out' : 'opacity-100 ease-in'}
          `}
                    aria-hidden="true"
                >
          <svg className="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </span>

                {/* Icona LUNA (Visibile solo in Dark Mode) */}
                <span
                    className={`
            absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-300
            ${isDark ? 'opacity-100 ease-in' : 'opacity-0 ease-out'}
          `}
                    aria-hidden="true"
                >
          <svg className="h-4 w-4 text-slate-700" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" clipRule="evenodd" />
          </svg>
        </span>
      </span>
        </button>
    );
};

export default ThemeToggle;