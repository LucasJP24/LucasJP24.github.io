/**
 * PROJECTS — everything shown in the Projects section of the home page.
 * ---------------------------------------------------------------------------
 * To add a project: copy one { ... } block, paste it where you want it to
 * appear (the list is shown top to bottom), and fill it in.
 *
 *   title        required  Project name
 *   description  required  1–3 sentences
 *   tags         required  Names from data/tags.js (unknown ones show grey)
 *   image        optional  Path from the site root, e.g. 'assets/media/images/x.png'
 *   imageAlt     optional  What the image shows, for screen readers
 *   meta         optional  Short facts, e.g. ['8 weeks', 'Team of 7', 'Tools programmer']
 *   link         optional  Write-up or project page. Leave out = not clickable
 *
 * Don't forget the comma between blocks.
 */
const PROJECTS = [
    {
        title: 'Procedural Planet Generation',
        description:
            'A planet generator built on a cube sphere and fractal noise, fast enough to regenerate at runtime. ' +
            'Parameters are saved to JSON so the game can rebuild the exact same planet.',
        tags: ['Graphics', 'Procedural'],
        image: 'assets/media/ppg/earth_w8_mountains2.png',
        imageAlt: 'Generated Earth-like planet with mountains and oceans',
        // meta: ['8 weeks', 'Solo project'],
        link: 'blog/procedural-planet-generation.html',
    },
    {
        title: 'Wave Function Collapse plugin',
        description:
            'A Wave Function Collapse plugin for Unreal Engine that identifies its constraints automatically.',
        tags: ['Unreal Engine', 'Procedural'],
        // image: 'assets/media/images/wfc/cover.png',
        // link: 'blog/wfc-plugin.html',
    },
    {
        title: 'Whoop Engine',
        description: 'A custom C++ game engine.',
        tags: ['Custom Engine', 'Team'],
        // image: 'assets/media/images/bee/cover.png',
        // link: 'blog/bee-engine.html',
    },
];
