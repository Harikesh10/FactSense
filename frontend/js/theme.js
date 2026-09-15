/**
 * FactSense — Global Dark/Light Theme Toggle
 * Shared across all pages. Persists preference in localStorage.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'factsense-theme';

  // Determine initial theme
  function getInitialTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    // Default to light
    return 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Update toggle button icons visibility
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      const sunIcon = toggleBtn.querySelector('.theme-icon-light');
      const moonIcon = toggleBtn.querySelector('.theme-icon-dark');
      if (sunIcon && moonIcon) {
        if (theme === 'dark') {
          sunIcon.style.display = 'none';
          moonIcon.style.display = 'block';
        } else {
          sunIcon.style.display = 'block';
          moonIcon.style.display = 'none';
        }
      }
    }
  }

  // Apply immediately (before DOM loads to prevent flash)
  const initial = getInitialTheme();
  document.documentElement.setAttribute('data-theme', initial);

  // Bind toggle button when DOM is ready
  function bindToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    applyTheme(getInitialTheme());

    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindToggle);
  } else {
    bindToggle();
  }
})();
