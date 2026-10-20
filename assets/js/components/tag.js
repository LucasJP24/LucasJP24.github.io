/**
 * Tag
 * ---------------------------------------------------------------------------
 * createTag("C++") → <li class="tag" style="--tag-hue: 210">C++</li>
 *
 * The colour comes from TAGS in data/tags.js, so "C++" is the same colour
 * everywhere on the site. Unknown tags turn grey and log a warning in the
 * browser console (F12) telling you to add them.
 *
 * Kept separate from project-list.js so blog posts can reuse it later.
 */
function createTag(name) {
    const tag = document.createElement('li');
    tag.className = 'tag';
    tag.textContent = name;

    const info = typeof TAGS !== 'undefined' ? TAGS[name] : undefined;

    if (info) {
        tag.style.setProperty('--tag-hue', info.hue);
    } else {
        tag.classList.add('tag--unknown');
        console.warn(`Tag "${name}" has no colour yet. Add it to data/tags.js.`);
    }

    return tag;
}
