/**
 * Noise field — the topographic contour map behind the hero.
 * ---------------------------------------------------------------------------
 * Hook:   <canvas data-noise-field>
 *         [data-noise-reseed]  button that generates a new map
 *         [data-noise-seed]    element that shows the current seed
 *
 * The pipeline, in four steps:
 *   1. Perlin noise with a seeded shuffle table, so the same seed always
 *      gives the same map (same idea as saving planet parameters to JSON).
 *   2. Fractal noise: octaves, lacunarity and gain, the same setup as in
 *      the Procedural Planet Generation write-up.
 *   3. Sample that height field on a grid of points.
 *   4. Marching squares: for each grid cell and each height level, find
 *      where the level crosses the cell's edges and draw a short line
 *      between those points. All the little lines together form contours.
 *
 * It only draws when needed (load, resize, theme change, new seed), so it
 * costs nothing while the visitor is just reading.
 */

// ---- 1. Seeded random + Perlin noise ---------------------------------------

/** Small, fast seeded random number generator (returns 0..1). */
function mulberry32(seed) {
    return function () {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** Returns a 2D Perlin noise function noise(x, y) → roughly -1..1 */
function createPerlin2D(seed) {
    const random = mulberry32(seed);

    // Shuffle 0..255 with the seeded random, then double it to avoid wrapping
    const p = Array.from({ length: 256 }, (_, i) => i);
    for (let i = 255; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [p[i], p[j]] = [p[j], p[i]];
    }
    const perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

    const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10); // smoothstep curve
    const lerp = (a, b, t) => a + (b - a) * t;
    const grad = (hash, x, y) => {
        switch (hash & 3) {
            case 0: return x + y;
            case 1: return -x + y;
            case 2: return x - y;
            default: return -x - y;
        }
    };

    return function noise(x, y) {
        const xFloor = Math.floor(x);
        const yFloor = Math.floor(y);
        const xi = xFloor & 255;
        const yi = yFloor & 255;
        const xf = x - xFloor;
        const yf = y - yFloor;
        const u = fade(xf);
        const v = fade(yf);

        const aa = perm[perm[xi] + yi];
        const ab = perm[perm[xi] + yi + 1];
        const ba = perm[perm[xi + 1] + yi];
        const bb = perm[perm[xi + 1] + yi + 1];

        return lerp(
            lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
            lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
            v
        );
    };
}

// ---- 2. Fractal noise --------------------------------------------------------

const FRACTAL = {
    octaves: 4,
    baseFrequency: 1 / 420, // 1 noise unit per 420 CSS pixels
    lacunarity: 2.0,        // frequency multiplier per octave
    gain: 0.45,             // amplitude multiplier per octave (a bit smoother than 0.5)
};

function fractalNoise(noise, x, y) {
    let frequency = FRACTAL.baseFrequency;
    let amplitude = 1;
    let value = 0;

    for (let i = 0; i < FRACTAL.octaves; i++) {
        value += noise(x * frequency, y * frequency) * amplitude;
        frequency *= FRACTAL.lacunarity;
        amplitude *= FRACTAL.gain;
    }
    return value;
}

// ---- 3 + 4. Sampling + marching squares ------------------------------------

const CELL_SIZE = 10;        // CSS pixels between grid samples
const LEVEL_COUNT = 12;      // number of contour heights
const MAJOR_EVERY = 4;       // every 4th line is drawn stronger, like on real maps

/*
 * Marching squares lookup.
 * Corners: a = top-left, b = top-right, c = bottom-right, d = bottom-left.
 * Each corner above the level adds a bit: a=8, b=4, c=2, d=1 → case 0..15.
 * Edges:   0 = top (a-b), 1 = right (b-c), 2 = bottom (d-c), 3 = left (a-d).
 * Each case lists which edges to connect with a line.
 */
const SEGMENTS = [
    [], [[3, 2]], [[2, 1]], [[3, 1]],
    [[0, 1]], [[3, 0], [2, 1]], [[0, 2]], [[3, 0]],
    [[3, 0]], [[0, 2]], [[0, 1], [3, 2]], [[0, 1]],
    [[3, 1]], [[2, 1]], [[3, 2]], [],
];

function drawContours(canvas, seed) {
    const context = canvas.getContext('2d');
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width === 0 || height === 0) return;

    // Draw at the screen's real pixel density so lines stay sharp
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    // Sample the height field once per grid point
    const noise = createPerlin2D(seed);
    const columns = Math.ceil(width / CELL_SIZE) + 1;
    const rows = Math.ceil(height / CELL_SIZE) + 1;
    const field = new Float32Array(columns * rows);
    let min = Infinity;
    let max = -Infinity;

    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            const value = fractalNoise(noise, column * CELL_SIZE, row * CELL_SIZE);
            field[row * columns + column] = value;
            if (value < min) min = value;
            if (value > max) max = value;
        }
    }

    // Colours come from CSS, so they follow the theme automatically
    const styles = getComputedStyle(canvas);
    const minorColor = styles.getPropertyValue('--contour-minor').trim();
    const majorColor = styles.getPropertyValue('--contour-major').trim();

    for (let level = 1; level < LEVEL_COUNT; level++) {
        const threshold = min + ((max - min) * level) / LEVEL_COUNT;
        const isMajor = level % MAJOR_EVERY === 0;

        context.beginPath();
        context.strokeStyle = isMajor ? majorColor : minorColor;
        context.lineWidth = isMajor ? 1.4 : 1;

        for (let row = 0; row < rows - 1; row++) {
            for (let column = 0; column < columns - 1; column++) {
                const a = field[row * columns + column];
                const b = field[row * columns + column + 1];
                const c = field[(row + 1) * columns + column + 1];
                const d = field[(row + 1) * columns + column];

                const index = (a > threshold ? 8 : 0) | (b > threshold ? 4 : 0)
                    | (c > threshold ? 2 : 0) | (d > threshold ? 1 : 0);
                if (index === 0 || index === 15) continue; // cell fully below / above

                const x = column * CELL_SIZE;
                const y = row * CELL_SIZE;
                // How far along an edge the level is crossed (linear interpolation)
                const t = (from, to) => (threshold - from) / (to - from);

                const edgePoint = (edge) => {
                    switch (edge) {
                        case 0: return [x + t(a, b) * CELL_SIZE, y];
                        case 1: return [x + CELL_SIZE, y + t(b, c) * CELL_SIZE];
                        case 2: return [x + t(d, c) * CELL_SIZE, y + CELL_SIZE];
                        default: return [x, y + t(a, d) * CELL_SIZE];
                    }
                };

                for (const [from, to] of SEGMENTS[index]) {
                    const [x1, y1] = edgePoint(from);
                    const [x2, y2] = edgePoint(to);
                    context.moveTo(x1, y1);
                    context.lineTo(x2, y2);
                }
            }
        }
        context.stroke();
    }
}

// ---- Wiring it to the page -------------------------------------------------

function initNoiseField() {
    const canvas = document.querySelector('[data-noise-field]');
    if (!canvas || !canvas.getContext) return;

    const reseedButton = document.querySelector('[data-noise-reseed]');
    const seedLabel = document.querySelector('[data-noise-seed]');

    let seed = Math.floor(Math.random() * 100000);
    let frameRequested = false;

    // Group several redraw requests into one per animation frame
    const redraw = () => {
        if (frameRequested) return;
        frameRequested = true;
        requestAnimationFrame(() => {
            frameRequested = false;
            drawContours(canvas, seed);
            if (seedLabel) seedLabel.textContent = `Seed ${seed}`;
        });
    };

    if (reseedButton) {
        reseedButton.addEventListener('click', () => {
            seed = Math.floor(Math.random() * 100000);
            redraw();
        });
    }

    document.addEventListener('themechange', redraw);
    new ResizeObserver(redraw).observe(canvas); // also fires once at start
}

initNoiseField();
