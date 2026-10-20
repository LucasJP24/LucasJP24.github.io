/**
 * Reading time
 * ---------------------------------------------------------------------------
 * Hook:   [data-reading-source] = the element whose words are counted
 *         [data-reading-time]   = where "X min read • Y words" is written
 *
 * Change from the old version: it used to count the whole <body> (nav links,
 * footer, code blocks). Now it only counts the article text and skips <pre>
 * code blocks, because nobody "reads" code at 200 words per minute.
 */
function initReadingTime() {
    const source = document.querySelector('[data-reading-source]');
    const output = document.querySelector('[data-reading-time]');
    if (!source || !output) return;

    const WORDS_PER_MINUTE = 200;

    // Work on a copy so we can remove code blocks without touching the page
    const copy = source.cloneNode(true);
    copy.querySelectorAll('pre').forEach((block) => block.remove());

    const words = copy.textContent.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));

    output.textContent = `${minutes} min read • ${words} words`;
}

initReadingTime();
