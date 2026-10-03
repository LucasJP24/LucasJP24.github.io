/**
 * Theme toggle
 * ---------------------------------------------------------------------------
 * Hook:   any <button data-theme-toggle>.
 * Logic:  flips <html data-theme> between "dark" and "light", saves the
 *         choice, and fires a "themechange" event on document so other
 *         components (like the hero contour map) can redraw in new colours.
 */
function initThemeToggle() {
    const root = document.documentElement;
    const buttons = document.querySelectorAll('[data-theme-toggle]');
    if (buttons.length === 0) return;

    const syncLabels = () => {
        const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
        buttons.forEach((button) => button.setAttribute('aria-label', `Switch to ${next} theme`));
    };

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
            root.dataset.theme = next;

            try {
                localStorage.setItem('theme', next);
            } catch (error) {
                // Not saved, but the switch still works for this visit
            }

            syncLabels();
            document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
        });
    });

    syncLabels();
}

initThemeToggle();
