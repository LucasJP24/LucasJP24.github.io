/**
 * Frame scrubber
 * ---------------------------------------------------------------------------
 * Hook:   any element with [data-frame-scrubber] and a data-frames attribute
 *         holding a comma-separated list of image paths.
 * Inside: .frame-scrubber__image, .frame-scrubber__input,
 *         .frame-scrubber__current, .frame-scrubber__total
 *
 * New compared to the old version: all frames are preloaded up front, so
 * dragging the slider swaps images instantly instead of flashing blank
 * while each image downloads for the first time.
 */
function initFrameScrubbers(root = document) {
    root.querySelectorAll('[data-frame-scrubber]').forEach((scrubber) => {
        const frames = (scrubber.dataset.frames || '')
            .split(',')
            .map((path) => path.trim())
            .filter(Boolean);
        if (frames.length === 0) return;

        const image = scrubber.querySelector('.frame-scrubber__image');
        const input = scrubber.querySelector('.frame-scrubber__input');
        const current = scrubber.querySelector('.frame-scrubber__current');
        const total = scrubber.querySelector('.frame-scrubber__total');

        // Preload: creating an Image object makes the browser fetch & cache it
        frames.forEach((src) => {
            new Image().src = src;
        });

        input.min = 0;
        input.max = frames.length - 1;
        input.step = 1;
        input.value = 0;
        total.textContent = frames.length;

        const showFrame = (index) => {
            image.src = frames[index];
            current.textContent = index + 1;
        };

        input.addEventListener('input', () => showFrame(Number(input.value)));
        showFrame(0);
    });
}

initFrameScrubbers();
