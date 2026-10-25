'use strict';
const script = document.querySelector('script[data-root]');
const root = script.dataset.root;
const sidebar = document.querySelector('.sidebar');
const menuButton = document.querySelector('.open-menu');
const scrim = document.querySelector('.menu-scrim');
function setMenu(open) {
  sidebar.classList.toggle('open', open);
  sidebar.inert = mobile.matches && !open;
  scrim.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('dialog-open', open);
  if (open) sidebar.querySelector('.close-menu').focus();
  else menuButton.focus();
}
menuButton.addEventListener('click', () => setMenu(true));
document.querySelector('.close-menu').addEventListener('click', () => setMenu(false));
scrim.addEventListener('click', () => setMenu(false));
const mobile = window.matchMedia('(max-width: 720px)');
sidebar.inert = mobile.matches;
mobile.addEventListener('change', event => {
  if (!event.matches && sidebar.classList.contains('open')) setMenu(false);
  sidebar.inert = event.matches && !sidebar.classList.contains('open');
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && sidebar.classList.contains('open')) setMenu(false);
  if (event.key === 'Tab' && sidebar.classList.contains('open')) {
    const focusable = [...sidebar.querySelectorAll('a,button')];
    const first = focusable[0]; const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
const searchDialog = document.querySelector('#search-dialog');
const searchInput = document.querySelector('#guide-search');
const searchStatus = document.querySelector('#search-status');
const searchResults = document.querySelector('#search-results');
let indexPromise;
function loadIndex() {
  if (!indexPromise) indexPromise = fetch(`${root}assets/search-index.json`)
    .then(response => { if (!response.ok) throw new Error('Search unavailable'); return response.json(); })
    .catch(error => { indexPromise = undefined; throw error; });
  return indexPromise;
}
let request = 0;
async function renderSearch() {
  const query = searchInput.value.trim().toLowerCase();
  const currentRequest = ++request;
  searchResults.replaceChildren();
  if (!query) { searchStatus.textContent = 'Search by task, feature, or question.'; return; }
  searchStatus.textContent = 'Searching…';
  try {
    const index = await loadIndex();
    if (currentRequest !== request) return;
    const words = query.split(/\s+/);
    const results = index.filter(entry => words.every(word => `${entry.title} ${entry.text}`.toLowerCase().includes(word)))
      .sort((a, b) => Number(b.title.toLowerCase().includes(query)) - Number(a.title.toLowerCase().includes(query)));
    searchStatus.textContent = results.length ? `${results.length} ${results.length === 1 ? 'chapter' : 'chapters'} found` : 'No matching chapters. Try a shorter phrase such as “stock” or “backup”.';
    for (const entry of results) {
      const link = document.createElement('a'); link.href = root + entry.url;
      const title = document.createElement('b'); title.textContent = entry.title;
      const snippet = document.createElement('p');
      const at = entry.text.toLowerCase().indexOf(words[0]);
      const start = Math.max(0, at - 50);
      snippet.textContent = `${start ? '…' : ''}${entry.text.slice(start, start + 180)}…`;
      link.append(title, snippet); searchResults.append(link);
    }
  } catch {
    if (currentRequest !== request) return;
    searchStatus.textContent = 'Search could not load. Check your connection or browse the chapters using the menu.';
  }
}
function openSearch() { searchDialog.showModal(); searchInput.focus(); renderSearch(); }
document.querySelector('.search-trigger').hidden = false;
document.querySelector('.search-trigger').addEventListener('click', openSearch);
document.querySelector('.close-search').addEventListener('click', () => searchDialog.close());
searchInput.addEventListener('input', renderSearch);
document.addEventListener('keydown', event => {
  if (event.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !document.activeElement.isContentEditable && !document.querySelector('dialog[open]') && !sidebar.classList.contains('open')) { event.preventDefault(); openSearch(); }
});
const imageDialog = document.querySelector('#image-dialog');
for (const link of document.querySelectorAll('.image-link')) {
  link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const source = link.querySelector('img'); const image = imageDialog.querySelector('img');
    image.src = source.src; image.alt = source.alt;
    imageDialog.querySelector('p').textContent = link.closest('figure').querySelector('figcaption').textContent;
    imageDialog.showModal();
  });
}
document.querySelector('.close-image').addEventListener('click', () => imageDialog.close());
for (const dialog of document.querySelectorAll('dialog')) {
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
}
const printButton = document.querySelector('.print-button');
if (printButton) { printButton.hidden = false; printButton.addEventListener('click', () => window.print()); }
const tocLinks = [...document.querySelectorAll('.page-toc nav a')];
if (tocLinks.length) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      for (const link of tocLinks) {
        const active = link.hash === `#${entry.target.id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
      }
    }
  }, { rootMargin: '-100px 0px -65% 0px' });
  document.querySelectorAll('.prose h2').forEach(heading => observer.observe(heading));
}
