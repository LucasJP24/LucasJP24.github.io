/**
 * TAGS — every tag name and its colour.
 * ---------------------------------------------------------------------------
 * A colour is a HUE on the colour wheel (0–360):
 *     0 red · 30 orange · 50 yellow · 120 green · 180 cyan
 *     210 blue · 265 purple · 320 pink
 * The theme decides how light or dark it is, so one number works in both
 * dark and light mode.
 *
 * Tag names must match EXACTLY what you write in data/projects.js
 * ("C++" and "c++" are different tags).
 */
const TAGS = {
    // Languages
    'C++': { hue: 210 },
    'C#': { hue: 265 },

    // Engines & APIs
    'Custom Engine': { hue: 190 },
    'Unreal Engine': { hue: 230 },
    'OpenGL': { hue: 0 },

    // Topics
    'Procedural': { hue: 130 },
    'Tools': { hue: 35 },
    'Optimization': { hue: 320 },

    // Context
    'Solo': { hue: 50 },
    'Team': { hue: 170 },
};
