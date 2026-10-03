/**
 * theme-init.js — runs BEFORE the page is drawn (loaded without `defer`).
 * ---------------------------------------------------------------------------
 * Picks the theme and writes it to <html data-theme="...">.
 *   1. A theme the visitor chose earlier (saved in localStorage) wins.
 *   2. Otherwise follow the operating system setting.
 *   3. If the OS says nothing, use dark.
 *
 * Why not do this in a deferred script? Deferred scripts run after the first
 * paint, so a light-mode visitor would see a flash of the dark page first.
 * This file is tiny, so blocking for it costs nothing noticeable.
 */
(function () {
    var theme = null;
    try {
        theme = localStorage.getItem('theme');
    } catch (error) {
        // Storage can be blocked (private mode, strict settings): just ignore it
    }

    if (theme !== 'light' && theme !== 'dark') {
        theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    document.documentElement.dataset.theme = theme;
})();
