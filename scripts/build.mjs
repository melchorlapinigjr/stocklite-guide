import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { marked } from 'marked';

const slug = text => text.toLowerCase().replace(/[^\w\- ]/g, '').replace(/ /g, '-');
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const source = await readFile('content/user-guide.md', 'utf8');
const groups = [
  ['GETTING STARTED', ['get-started', 'find-your-way-around']],
  ['EVERYDAY TASKS', ['add-and-manage-products', 'manage-stock', 'use-barcodes', 'record-a-sale']],
  ['REPORTS & DATA', ['understand-reports', 'export-sales-reports', 'back-up-and-restore-your-records']],
  ['PREFERENCES & HELP', ['change-your-settings', 'use-stocklite-pro', 'build-a-daily-routine', 'troubleshooting', 'frequently-asked-questions']],
];
const descriptions = {
  'get-started': 'Set up your currency, add your first products, and make a backup.',
  'find-your-way-around': 'Meet your Dashboard, Inventory, Reports, and Settings.',
  'add-and-manage-products': 'Create products, set prices, and keep your catalog organized.',
  'manage-stock': 'Record deliveries, adjust quantities, and spot low stock.',
  'use-barcodes': 'Assign product barcodes and add items to a sale with a scan.',
  'record-a-sale': 'Build a cart, apply a discount, and complete checkout.',
  'understand-reports': 'Make sense of your sales, discounts, and payment totals.',
  'export-sales-reports': 'Save a CSV or PDF sales report on Android with Pro.',
  'back-up-and-restore-your-records': 'Protect your records and move a snapshot to another device.',
  'change-your-settings': 'Choose your currency, language, and appearance.',
  'use-stocklite-pro': 'Explore Pro features and manage your subscription.',
  'build-a-daily-routine': 'A simple checklist for opening, trading, and closing.',
  'troubleshooting': 'Find practical answers when something does not work as expected.',
  'frequently-asked-questions': 'Quick answers about offline use, payments, backups, and more.',
};
const shortTitles = {
 'add-and-manage-products': 'Products', 'back-up-and-restore-your-records': 'Backup & restore',
 'find-your-way-around': 'App navigation', 'change-your-settings': 'Settings',
 'frequently-asked-questions': 'FAQs', 'build-a-daily-routine': 'Daily routine',
};
const chapters = source.split(/^## /m).slice(1).map(block => {
 const [title, ...lines] = block.split('\n');
 return { title, id: slug(title), markdown: lines.join('\n').trim() };
}).filter(c => c.title !== 'Contents');
const chapterMap = new Map(chapters.map(c => [c.id, c]));
const icon = (name, cls = '') => {
 const paths = {
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  box: '<path d="m12 3 9 5v8l-9 5-9-5V8l9-5Zm0 9 9-4M3 8l9 4v9M7.5 5.5l9 5"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Zm3 5h6m-6 4h6"/>',
  backup: '<path d="M7 17H6a4 4 0 0 1-1-8 7 7 0 0 1 13-1 4.5 4.5 0 0 1 0 9h-1M12 21V11m-4 4 4-4 4 4"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  print: '<path d="M7 8V3h10v5M7 17H4V8h16v9h-3M7 14h10v7H7v-7Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  zoom: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5M7 10h6m-3-3v6"/>',
 };
 return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
};
function sidebar(current, prefix) {
 return `<aside class="sidebar" id="chapter-navigation"><div class="sidebar-top"><span>THE USER GUIDE</span><button class="icon-button mobile-only close-menu" aria-label="Close navigation">${icon('close')}</button></div><a class="overview-link ${current === 'home' ? 'active' : ''}" href="${prefix}index.html" ${current === 'home' ? 'aria-current="page"' : ''}>Guide overview ${icon('arrow')}</a>${groups.map(([label, ids]) => `<div class="nav-group"><p>${label}</p><ul>${ids.map(id => `<li><a href="${prefix}guide/${id}.html" ${id === current ? 'class="active" aria-current="page"' : ''}>${escape(shortTitles[id] || chapterMap.get(id).title)}</a></li>`).join('')}</ul></div>`).join('')}<div class="sidebar-note"><span class="status-dot"></span><div>Built for everyday business<small>Android guide · October 2026</small></div></div></aside>`;
}
function shell({title, description, current, prefix, body, toc = ''}) {
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${escape(description)}"><meta name="theme-color" content="#075b73"><title>${escape(title)} · StockLite Guide</title><link rel="icon" href="${prefix}assets/logo.svg" type="image/svg+xml"><link rel="stylesheet" href="${prefix}assets/style.css"><script src="${prefix}assets/app.js" defer data-root="${prefix}"></script></head><body><a class="skip-link" href="#main">Skip to content</a><header class="topbar"><a class="brand" href="${prefix}index.html"><img src="${prefix}assets/logo.svg" width="34" height="34" alt=""><span>StockLite</span><span class="brand-divider"></span><span class="brand-label">Help center</span></a><div class="header-actions"><button class="search-trigger" aria-label="Search the guide" hidden>${icon('search')}<span>Search the guide</span><kbd>/</kbd></button><a class="header-help" href="${prefix}guide/frequently-asked-questions.html">FAQs ${icon('arrow')}</a><button class="icon-button mobile-only open-menu" aria-label="Open navigation" aria-expanded="false" aria-controls="chapter-navigation">${icon('menu')}</button></div></header><div class="layout">${sidebar(current,prefix)}<main id="main" tabindex="-1" class="${current === 'home' ? 'home-main' : 'article-main'}">${body}<footer class="site-footer"><span>StockLite <span class="footer-dot">/</span> A little clarity for your business.</span><a href="${prefix}content/user-guide.md" download>Download Markdown ${icon('arrow')}</a></footer></main>${toc}</div><button class="menu-scrim" hidden aria-label="Close navigation"></button><dialog id="search-dialog" aria-labelledby="search-title"><div class="dialog-header"><h2 id="search-title">Search the guide</h2><button class="icon-button close-search" aria-label="Close search">${icon('close')}</button></div><div class="search-input-wrap">${icon('search')}<input id="guide-search" type="search" placeholder="Try “barcode” or “restore backup”" autocomplete="off" aria-label="Search all chapters"></div><p id="search-status" role="status">Search by task, feature, or question.</p><div id="search-results"></div><div class="search-footer">Search stays in your browser. <kbd>Esc</kbd> to close</div></dialog><dialog id="image-dialog" aria-label="Expanded screenshot"><button class="icon-button close-image" aria-label="Close screenshot">${icon('close')}</button><img alt=""><p></p></dialog></body></html>`;
}
function renderMarkdown(text) {
 const renderer = new marked.Renderer();
 renderer.heading = function({tokens, depth, text}) {depth = Math.max(2, depth - 1); return `<h${depth} id="${slug(text)}">${this.parser.parseInline(tokens)}</h${depth}>\n`;};
 let html = marked.parse(text.replaceAll('](images/user-guide/', '](../assets/images/'), { renderer });
 html = html.replace(/<p><img src="([^"]+)" alt="([^"]*)"><\/p>\s*<p><em>([\s\S]*?)<\/em><\/p>/g, (_, src, alt, caption) => `<figure class="screenshot"><a href="${src}" class="image-link" aria-label="Enlarge screenshot: ${alt}"><div class="image-toolbar"><span>IN THE APP</span><span>${icon('zoom')} Tap to enlarge</span></div><img src="${src}" alt="${alt}" loading="lazy" decoding="async"></a><figcaption>${caption}</figcaption></figure>`);
 html = html.replace(/<table>/g, '<div class="table-scroll" tabindex="0" role="region" aria-label="Scrollable reference table"><table>').replace(/<\/table>/g, '</table></div>');
 html = html.replace(/<p><strong>(Changing currency does not convert existing amounts\.|Restoring replaces[\s\S]*?|Keep a copy away from the device\.)<\/strong>([\s\S]*?)<\/p>/g, '<div class="callout"><p><strong>$1</strong>$2</p></div>');
 return html;
}
await mkdir('guide', {recursive:true});
const cards = [ ['box','add-and-manage-products','Build your inventory'],['receipt','record-a-sale','Make your first sale'],['backup','back-up-and-restore-your-records','Keep your records safe'] ];
const homeBody = `<div class="home-eyebrow"><span class="status-dot"></span> THE STOCKLITE USER GUIDE</div><section class="hero"><div class="hero-copy"><h1>Know your stock.<br><span>Keep business moving.</span></h1><p>Your everyday companion to products, sales, and the numbers that matter. Find a quick answer or learn one step at a time.</p><a class="primary-button" href="guide/get-started.html">Get started ${icon('arrow')}</a><a class="text-link" href="#browse">Explore the guide ↓</a><div class="hero-meta"><span>${icon('check')} Step-by-step instructions</span><span>${icon('check')} Real app screenshots</span></div></div><div class="hero-visual" aria-hidden="true"><div class="visual-kicker"><span class="status-dot"></span> YOUR BUSINESS, AT A GLANCE</div><div class="visual-heading">A simpler day<br>starts here.</div><div class="demo-stock"><div class="demo-icon">${icon('box')}</div><div><b>Bottled Water</b><span>500 ml · Example product</span></div><div class="stock-pill">24 in stock</div></div><div class="visual-flow"><span>Track stock</span><span>→</span><span>Record sales</span><span>→</span><span>Review</span></div><div class="visual-bottom"><img src="assets/logo.svg" alt=""><span>A little less guesswork.<br>A lot more clarity.</span><span class="visual-star">✳</span></div></div></section><section class="quick-start"><div class="section-heading"><h2>What would you like to do?</h2><span>Start with a task</span></div><div class="task-grid">${cards.map(([ic,id,title],i)=>`<a class="task-card" href="guide/${id}.html"><span class="task-icon">${icon(ic)}</span><span class="card-number">0${i+1}</span><h3>${title}</h3><p>${descriptions[id]}</p><span class="card-link">Read the guide ${icon('arrow')}</span></a>`).join('')}</div></section><section class="browse-section" id="browse"><div class="section-heading"><h2>A guide for every step</h2><span>14 chapters</span></div><div class="chapter-grid">${groups.map(([label,ids])=>`<div class="chapter-group"><h3>${label}</h3>${ids.map(id=>`<a href="guide/${id}.html"><span>${escape(chapterMap.get(id).title)}</span>${icon('arrow')}</a>`).join('')}</div>`).join('')}</div></section><aside class="home-note"><span class="note-symbol">i</span><div><b>Your records live on your device.</b><p>Make a backup and export a separate copy to protect your work.</p></div><a href="guide/back-up-and-restore-your-records.html">Learn how ${icon('arrow')}</a></aside><div class="guide-meta"><p>Updated October 2026 · English · Android screenshots</p><p>Features and labels may vary by release, platform, and language. Sample amounts and quantities are illustrative.</p></div>`;
await writeFile('index.html', shell({title:'Your everyday business companion',description:'The StockLite user guide. Learn inventory, barcode scanning, checkout, reporting, and backups with clear steps and app screenshots.',current:'home',prefix:'',body:homeBody}));
const search = [];
for (const [i, c] of chapters.entries()) {
 const headings=[...c.markdown.matchAll(/^### (.+)$/gm)].map(m=>({title:m[1],id:slug(m[1])}));
 const sectionGroup=groups.find(([,ids])=>ids.includes(c.id))[0];
 const body=`<div class="breadcrumbs"><a href="../index.html">Guide</a><span>/</span><span>${sectionGroup.toLowerCase()}</span></div><header class="article-header"><div class="chapter-label">CHAPTER ${String(i+1).padStart(2,'0')} <span>·</span> ${Math.max(1,Math.ceil(c.markdown.split(/\s+/).length/200))} MIN READ</div><h1>${c.title}</h1><p>${descriptions[c.id]}</p><div class="article-tools"><span>Updated October 2026</span><button class="print-button" hidden>${icon('print')} Print chapter</button></div></header><article class="prose">${renderMarkdown(c.markdown)}</article><nav class="article-pagination" aria-label="Other chapters">${i>0?`<a href="${chapters[i-1].id}.html"><span>← PREVIOUS</span><b>${chapters[i-1].title}</b></a>`:'<a href="../index.html"><span>← OVERVIEW</span><b>Back to the guide</b></a>'}${i<chapters.length-1?`<a class="next" href="${chapters[i+1].id}.html"><span>NEXT CHAPTER →</span><b>${chapters[i+1].title}</b></a>`:''}</nav>`;
 const toc = headings.length ? `<aside class="page-toc"><p>ON THIS PAGE</p><nav aria-label="On this page">${headings.map(h=>`<a href="#${h.id}">${h.title}</a>`).join('')}</nav><a class="back-top" href="#main">Back to top ↑</a></aside>` : '';
 await writeFile(`guide/${c.id}.html`,shell({title:c.title,description:descriptions[c.id],current:c.id,prefix:'../',body,toc}));
 const text=c.markdown.replace(/!\[[^\]]*\]\([^)]*\)/g,'').replace(/\[([^\]]*)\]\([^)]*\)/g,'$1').replace(/[*#|`]/g,'').replace(/\s+/g,' ').trim();
 search.push({title:c.title,url:`guide/${c.id}.html`,description:descriptions[c.id],text});
}
await writeFile('assets/search-index.json',JSON.stringify(search));
console.log(`Built overview, ${chapters.length} chapters, and search index.`);
