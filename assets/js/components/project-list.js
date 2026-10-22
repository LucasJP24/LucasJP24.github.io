/**
 * Project list
 * ---------------------------------------------------------------------------
 * Hook:   [data-project-list]   = where the projects go
 *         #project-template     = the HTML for ONE project (in index.html)
 * Data:   PROJECTS from data/projects.js
 *
 * How it works:
 *   For every project object, clone the <template>, fill in the
 *   [data-field="..."] slots, then add all of them to the page in one go.
 *
 * Why a <template>? The HTML structure stays in the HTML file where it
 * belongs, and JS only fills in the content. To change the card layout you
 * edit index.html, not this script.
 *
 * Everything is written with textContent / attributes (never innerHTML), so
 * a "<" or "&" in a description can't break the page.
 */
function renderProjects() {
    const list = document.querySelector('[data-project-list]');
    const template = document.getElementById('project-template');
    if (!list || !template || typeof PROJECTS === 'undefined') return;

    // A fragment is an off-screen container: the browser lays out the page
    // once at the end, instead of once per project.
    const fragment = document.createDocumentFragment();
    PROJECTS.forEach((project) => fragment.append(createProjectCard(project, template)));
    list.append(fragment);
}

function createProjectCard(project, template) {
    const card = template.content.firstElementChild.cloneNode(true);
    const field = (name) => card.querySelector(`[data-field="${name}"]`);

    // Title + link (the link is stretched over the whole row in CSS)
    const titleLink = field('title');
    titleLink.textContent = project.title;
    if (project.link) {
        titleLink.href = project.link;
    } else {
        titleLink.removeAttribute('href');
        card.classList.add('project--static');
    }

    // Image (optional). No image = "Coming soon" placeholder, drawn in CSS
    // so it follows the dark/light theme toggle.
    const media = field('media');
    const image = media.querySelector('img');
    if (project.image) {
        image.src = project.image;
        image.alt = project.imageAlt || '';
    } else {
        image.remove();
        media.classList.add('project__media--soon');
        media.setAttribute('role', 'img');
        media.setAttribute('aria-label', 'Coming soon');
    }

    // Facts like "8 weeks", "Solo project" (optional)
    const meta = field('meta');
    if (project.meta && project.meta.length > 0) {
        project.meta.forEach((fact) => {
            const item = document.createElement('li');
            item.textContent = fact;
            meta.append(item);
        });
    } else {
        meta.remove();
    }

    // Tags (coloured via tag.js)
    const tags = field('tags');
    (project.tags || []).forEach((name) => tags.append(createTag(name)));

    field('description').textContent = project.description || '';

    return card;
}

renderProjects();
