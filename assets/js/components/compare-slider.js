/**
 * Compare slider
 * ---------------------------------------------------------------------------
 * Hook:   any element with [data-compare-slider] that contains a range input.
 * Logic:  the range input (0–100) writes its value into the CSS variable
 *         --pos on its own container. The CSS then uses --pos to clip
 *         image A and to move the handle. JS writes one number; CSS draws.
 *
 * Because each slider only touches its OWN container, you can put as many
 * on a page as you like without them interfering.
 */
function initCompareSliders(root = document) {
    root.querySelectorAll('[data-compare-slider]').forEach((slider) => {
        const input = slider.querySelector('input[type="range"]');
        if (!input) return;

        const update = () => slider.style.setProperty('--pos', `${input.value}%`);

        input.addEventListener('input', update);
        update(); // sync once on load, in case the input's start value isn't 50
    });
}

initCompareSliders();
